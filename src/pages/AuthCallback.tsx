import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // The AuthProvider listener in context/AuthContext.tsx will handle the session update.
    // This component just serves as a landing page to clear the hash and redirect.
    
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        toast.error('Error during sign in: ' + error.message);
        navigate('/login');
      } else {
        // Successful sign in is handled by onAuthStateChange in AuthProvider
        // We just redirect to home or dashboard
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Helmet>
        <title>Signing In | John20 Deals</title>
      </Helmet>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
}