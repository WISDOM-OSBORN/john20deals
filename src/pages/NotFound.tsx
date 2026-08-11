import { Link } from 'react-router-dom';
import { Home, ShoppingBag, MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <Helmet>
        <title>Page Not Found | John20 Deals</title>
        <meta name="description" content="The page you are looking for does not exist. Explore gadgets, laptops, and accessories at John20 Deals." />
      </Helmet>
      <p className="text-8xl font-black text-slate-200 dark:text-slate-800 leading-none select-none">404</p>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-6 mb-3">Page Not Found</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Home className="h-5 w-5" /> Back to Home
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <ShoppingBag className="h-5 w-5" /> Browse the Shop
        </Link>
        <a
          href="https://wa.me/233505694171"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
        >
          <MessageCircle className="h-5 w-5" /> Chat With Us
        </a>
      </div>
    </div>
  );
}
