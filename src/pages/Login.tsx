import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { useTheme } from '../context/ThemeContext';
import { Helmet } from 'react-helmet-async';

export default function Login() {
  const { isDark } = useTheme();
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Helmet>
        <title>Sign In | John20 Deals</title>
        <meta name="description" content="Sign in to your John20 Deals account to view your orders, wishlist, and manage your profile." />
      </Helmet>
      <SignIn path="/login" routing="path" signUpUrl="/signup" appearance={{ baseTheme: isDark ? dark : undefined }} />
    </div>
  );
}
