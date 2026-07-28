import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, User, LogOut, Menu, X, Laptop, Search, Heart, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { UserButton, SignInButton } from '@clerk/clerk-react';

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { theme, setTheme, isDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '/shop' }, // Simplified for now
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="John20 Deals Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">John20 Deals</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600",
                  location.pathname === link.path ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search (Visual only for now) */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-blue-500 w-48 dark:text-white dark:placeholder-slate-400"
              />
            </div>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="h-5 w-5 text-slate-300" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </button>

            <Link to="/wishlist" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Heart className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
                  Profile
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="h-5 w-5 text-slate-300" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </button>
             <Link to="/cart" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
               <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Sign Out
                </button>
               </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
