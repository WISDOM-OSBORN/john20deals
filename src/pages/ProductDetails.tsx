import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart, ArrowLeft, Check, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductReviews from '../components/ProductReviews';
import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  image_url_2?: string | null;
  category: string;
  description: string | null;
  stock: number;
  condition?: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/shop');
    } else {
      setProduct(data);
      setActiveImage(data.image_url);
    }
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1,
        condition: product.condition,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{product.name} | John20 Deals</title>
        <meta name="description" content={product.description || `Buy ${product.name} at John20 Deals. High-quality gadgets and accessories.`} />
        <meta property="og:title" content={`${product.name} | John20 Deals`} />
        <meta property="og:description" content={product.description || `Buy ${product.name} at John20 Deals.`} />
        <meta property="og:image" content={product.image_url || 'https://via.placeholder.com/600'} />
      </Helmet>
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 flex items-center justify-center aspect-square lg:aspect-auto h-full max-h-[500px]">
            <img
              src={activeImage || product.image_url || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-contain max-h-[400px]"
            />
          </div>
          
          {/* Thumbnails */}
          {product.image_url_2 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              <button 
                onClick={() => setActiveImage(product.image_url)}
                className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-white dark:bg-slate-900 ${activeImage === product.image_url ? 'border-blue-600' : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'}`}
              >
                <img src={product.image_url || 'https://via.placeholder.com/100'} alt="Thumbnail 1" className="w-full h-full object-cover" />
              </button>
              <button 
                onClick={() => setActiveImage(product.image_url_2 || null)}
                className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-white dark:bg-slate-900 ${activeImage === product.image_url_2 ? 'border-blue-600' : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'}`}
              >
                <img src={product.image_url_2} alt="Thumbnail 2" className="w-full h-full object-cover" />
              </button>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                IN STOCK
              </span>
              {product.condition && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  product.condition === 'New' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  product.condition === 'Open Box' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  product.condition === 'Refurbished' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {product.condition}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-medium">
                Category: {product.category}
              </span>
              <span>SKU: PT-{product.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(product.price)}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Inclusive of all taxes</p>
          </div>

          <div className="prose prose-slate dark:prose-invert mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Description</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>

            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                * Prices and availability are subject to change without notice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {product && <ProductReviews productId={product.id} />}
    </div>
  );
}
