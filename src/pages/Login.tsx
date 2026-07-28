import { SignIn } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';

export default function Login() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Helmet>
        <title>Sign In | John20 Deals</title>
        <meta name="description" content="Sign in to your John20 Deals account to view your orders, wishlist, and manage your profile." />
      </Helmet>
      <SignIn path="/login" routing="path" signUpUrl="/signup" />
    </div>
  );
}
