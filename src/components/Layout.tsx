import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: isDark ? {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          } : undefined
        }}
      />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
