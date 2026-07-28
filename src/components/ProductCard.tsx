import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category: string;
    condition?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
      condition: product.condition,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to use wishlist');
      navigate('/login');
      return;
    }
    toggleWishlist(product);
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-blue-900/20 transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-800 overflow-hidden p-4 flex items-center justify-center">
        <img
          src={product.image_url || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
        />
        {product.condition && (
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm ${
              product.condition === 'New' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
              product.condition === 'Open Box' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              product.condition === 'Refurbished' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {product.condition}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <button 
            onClick={handleToggleWishlist}
            className={`p-2 rounded-full shadow-md transition-all ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{product.category}</p>
        <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 flex-grow group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-black text-slate-900 dark:text-white">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white p-2.5 rounded-xl transition-all"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
