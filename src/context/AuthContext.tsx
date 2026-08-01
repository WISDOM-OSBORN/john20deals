import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk, useSession } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: any | null;
  session: any | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

// TEMPORARY fallback for existing admins. Move admin control to
// Clerk metadata (publicMetadata.role = 'admin') and remove this list.
const LEGACY_ADMIN_EMAILS = ['rockwellsan7@gmail.com', 'johndarkwah20@gmail.com'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { session: clerkSession, isLoaded: sessionLoaded } = useSession();
  const clerk = useClerk();

  const [isAdmin, setIsAdmin] = useState(false);
  
  const loading = !userLoaded || !sessionLoaded;
  
  let mappedUser = null;

  if (clerkUser) {
    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
    mappedUser = {
      id: clerkUser.id,
      email: primaryEmail,
      created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      user_metadata: {
        full_name: clerkUser.fullName || '',
        avatar_url: clerkUser.imageUrl || '',
        phone_number: clerkUser.unsafeMetadata?.phone_number || clerkUser.publicMetadata?.phone_number || '',
        location: clerkUser.unsafeMetadata?.location || clerkUser.publicMetadata?.location || '',
      }
    };
  }

  useEffect(() => {
    // Admin is determined by Clerk metadata (set in Clerk dashboard):
    // publicMetadata.role === 'admin' or unsafeMetadata.role === 'admin'.
    const role =
      clerkUser?.publicMetadata?.role ||
      clerkUser?.unsafeMetadata?.role ||
      'user';
    setIsAdmin(role === 'admin' || LEGACY_ADMIN_EMAILS.includes(mappedUser?.email || ''));
  }, [mappedUser?.email, clerkUser?.publicMetadata, clerkUser?.unsafeMetadata]);

  // Bridge Clerk identity into Supabase so orders/reviews (which FK to
  // profiles) do not fail. Upserts a profile row on every login.
  useEffect(() => {
    if (!clerkUser || !mappedUser) return;

    const syncProfile = async () => {
      const { error } = await supabase.from('profiles').upsert(
        {
          id: mappedUser.id,
          email: mappedUser.email,
          full_name: mappedUser.user_metadata.full_name || null,
          avatar_url: mappedUser.user_metadata.avatar_url || null,
          phone_number: mappedUser.user_metadata.phone_number || null,
          location: mappedUser.user_metadata.location || null,
        },
        { onConflict: 'id' }
      );
      if (error) console.warn('Profile sync warning:', error.message);
    };

    syncProfile();
  }, [clerkUser, mappedUser]);


  const signOut = async () => {
    try {
      await clerk.signOut();
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (clerkUser) {
         let updateData: any = {};
         if (data.full_name) {
           updateData.firstName = data.full_name.split(' ')[0];
           updateData.lastName = data.full_name.split(' ').slice(1).join(' ');
         }
         await clerkUser.update(updateData);
         
         await clerkUser.update({
           unsafeMetadata: { // using unsafe metadata from clerk client side since public metadata is read-only from client
             ...clerkUser.unsafeMetadata,
             phone_number: data.phone_number || clerkUser.unsafeMetadata?.phone_number,
             location: data.location || clerkUser.unsafeMetadata?.location,
             avatar_url: data.avatar_url || clerkUser.unsafeMetadata?.avatar_url
           }
         });

         // Persist to Supabase so admin Customers tab + profile stay in sync.
         const { error } = await supabase.from('profiles').upsert(
           {
             id: clerkUser.id,
             email: clerkUser.primaryEmailAddress?.emailAddress || '',
             full_name: data.full_name || clerkUser.fullName || null,
             avatar_url: data.avatar_url || clerkUser.imageUrl || null,
             phone_number: data.phone_number || null,
             location: data.location || null,
           },
           { onConflict: 'id' }
         );
         if (error) throw error;

         toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user: mappedUser, 
      session: clerkSession, 
      isAdmin, 
      loading, 
      signOut, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
