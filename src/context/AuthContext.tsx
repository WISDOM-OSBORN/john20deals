import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk, useSession } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: any | null;
  session: any | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, data: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

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
    if (mappedUser?.email === 'johndarkwah20@gmail.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [mappedUser?.email]);

  const signInWithGoogle = async () => {};
  const signInWithEmail = async (email: string, password: string) => {};
  const signUpWithEmail = async (email: string, password: string, data: any) => {};

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
             location: data.location || clerkUser.unsafeMetadata?.location
           }
         });
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
      signInWithGoogle, 
      signInWithEmail, 
      signUpWithEmail, 
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
