import { SignUp } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <Helmet>
        <title>Create Account | John20 Deals</title>
        <meta name="description" content="Create a John20 Deals account to start shopping for the latest gadgets and accessories." />
      </Helmet>
      <SignUp path="/signup" routing="path" signInUrl="/login" />
    </div>
  );
}
