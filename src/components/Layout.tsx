import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { MessageCircle, Phone } from 'lucide-react';

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
      <div className="h-16 md:hidden" aria-hidden="true"></div>
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 grid grid-cols-2 gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <a
          href="https://wa.me/233505694171"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="h-5 w-5" /> WhatsApp
        </a>
        <a
          href="tel:+233505694171"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
        >
          <Phone className="h-5 w-5" /> Call Us
        </a>
      </div>
    </div>
  );
}
