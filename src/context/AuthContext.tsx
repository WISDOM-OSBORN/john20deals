import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk, useSession } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

export interface AppUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    full_name: string;
    avatar_url: string;
    phone_number: string;
    location: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  session: any | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
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
  
  let mappedUser: AppUser | null = null;

  if (clerkUser) {
    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
    mappedUser = {
      id: clerkUser.id,
      email: primaryEmail,
      created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      user_metadata: {
        full_name: clerkUser.fullName || '',
        avatar_url: clerkUser.imageUrl || '',
        phone_number: String(clerkUser.unsafeMetadata?.phone_number || clerkUser.publicMetadata?.phone_number || ''),
        location: String(clerkUser.unsafeMetadata?.location || clerkUser.publicMetadata?.location || ''),
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

    // A user is a legacy admin if ANY of their verified emails (primary or
    // additional) matches the legacy admin list - not just the primary one.
    const verifiedEmails = new Set<string>();
    (clerkUser?.emailAddresses || []).forEach((ea) => {
      if (ea?.emailAddress) verifiedEmails.add(ea.emailAddress.toLowerCase());
    });
    if (clerkUser?.primaryEmailAddress?.emailAddress) {
      verifiedEmails.add(clerkUser.primaryEmailAddress.emailAddress.toLowerCase());
    }
    const isLegacyAdmin = LEGACY_ADMIN_EMAILS.some((email) =>
      verifiedEmails.has(email.toLowerCase())
    );

    setIsAdmin(role === 'admin' || isLegacyAdmin);
  }, [
    clerkUser?.publicMetadata,
    clerkUser?.unsafeMetadata,
    clerkUser?.emailAddresses,
  ]);

  // Bridge Clerk identity into Supabase so orders/reviews (which FK to
  // profiles) do not fail. Upserts a profile row on every login via the
  // service-role function (RLS blocks anon writes to profiles).
  useEffect(() => {
    if (!clerkUser || !mappedUser) return;

    const syncProfile = async () => {
      try {
        const { userOps } = await import('../lib/api');
        await userOps({
          action: 'syncProfile',
          profile: {
            id: mappedUser.id,
            email: mappedUser.email,
            full_name: mappedUser.user_metadata.full_name || null,
            phone: mappedUser.user_metadata.phone_number || null,
            location: mappedUser.user_metadata.location || null,
          },
        });
      } catch (error: any) {
        console.warn('Profile sync warning:', error.message);
      }
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

  return (
    <AuthContext.Provider value={{ 
      user: mappedUser, 
      session: clerkSession, 
      isAdmin, 
      loading, 
      signOut 
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
