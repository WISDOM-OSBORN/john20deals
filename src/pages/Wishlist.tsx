import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Wishlist() {
  const { items } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>My Wishlist | John20 Deals</title>
      </Helmet>
      
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-2xl">
          <Heart className="h-6 w-6 text-red-500 fill-current" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Wishlist</h1>
        <span className="ml-auto bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-sm font-bold">
          {items.length} Items
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            <ShoppingBag className="h-5 w-5" />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
