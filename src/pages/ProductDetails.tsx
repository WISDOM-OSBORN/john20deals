import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductReviews from '../components/ProductReviews';
import ImageUploadButtons from '../components/ImageUploadButtons';
import Breadcrumbs from '../components/Breadcrumbs';
import { uploadImage } from '../lib/upload';
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
  swap_allowed?: boolean;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Swap Modal State
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapUploading, setSwapUploading] = useState(false);
  const [swapImages, setSwapImages] = useState<string[]>([]);
  
  const handleSwapUpload = async (file: File) => {
    try {
      setSwapUploading(true);
      const url = await uploadImage(file);
      setSwapImages(prev => [...prev, url].slice(0, 3));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload image');
    } finally {
      setSwapUploading(false);
    }
  };
  
  const submitSwapRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to propose a swap');
      navigate('/auth');
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const apiEndpoint = import.meta.env.PROD ? '/.netlify/functions/submit-swap' : '/api/submit-swap';
    
    try {
      setSwapUploading(true);
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id,
          productName: product?.name,
          userId: user.id,
          userName: formData.get('userName'),
          userPhone: formData.get('userPhone'),
          description: formData.get('description'),
          imageUrls: swapImages
        })
      });
      if (!res.ok) throw new Error('Failed to submit swap');

      toast.success('Swap request sent! The shop will contact you.');
      setShowSwapModal(false);
      setSwapImages([]);
      navigate('/order-success?type=swap');
    } catch (error) {
      toast.error('Failed to submit swap request');
    } finally {
      setSwapUploading(false);
    }
  };


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
    if ((product?.stock ?? 0) <= 0) {
      toast.error('This product is out of stock');
      return;
    }
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

  const outOfStock = (product.stock ?? 0) <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{product.name} | John20 Deals</title>
        <meta name="description" content={product.description || `Buy ${product.name} at John20 Deals. High-quality gadgets and accessories.`} />
        <meta property="og:title" content={`${product.name} | John20 Deals`} />
        <meta property="og:description" content={product.description || `Buy ${product.name} at John20 Deals.`} />
        <meta property="og:image" content={product.image_url || 'https://placehold.co/600x600/f8fafc/94a3b8?text=Image'} />
        <meta property="og:url" content={`https://john20deals.com/product/${product.id}`} />
        <meta property="og:type" content="product" />
        <link rel="canonical" href={`https://john20deals.com/product/${product.id}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.image_url,
            description: product.description || undefined,
            sku: `PT-${product.id.slice(0, 8).toUpperCase()}`,
            category: product.category,
            brand: { '@type': 'Brand', name: 'John20 Deals' },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'GHS',
              price: product.price,
              availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
              url: `https://john20deals.com/product/${product.id}`,
              seller: { '@type': 'Organization', name: 'John20 Deals' }
            }
          })}
        </script>
      </Helmet>
      <Breadcrumbs items={[{ name: 'Shop', to: '/shop' }, { name: product.name }]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden aspect-square lg:aspect-auto h-full max-h-[500px]">
            <img
              src={activeImage || product.image_url || 'https://placehold.co/600x600/f8fafc/94a3b8?text=Image'}
              alt={product.name}
              className="w-full h-full object-contain max-h-[400px]"
            />
          </div>
          
          {/* Thumbnails */}
          {product.image_url_2 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              <button 
                onClick={() => setActiveImage(product.image_url)}
                className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-white dark:bg-slate-900 ${activeImage === product.image_url ? 'border-blue-600' : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'}`}
              >
                <img src={product.image_url || 'https://placehold.co/600x600/f8fafc/94a3b8?text=Image'} alt="Thumbnail 1" className="w-full h-full object-cover" />
              </button>
              <button 
                onClick={() => setActiveImage(product.image_url_2 || null)}
                className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-white dark:bg-slate-900 ${activeImage === product.image_url_2 ? 'border-blue-600' : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'}`}
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
              {outOfStock ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                  OUT OF STOCK
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                  IN STOCK
                </span>
              )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  outOfStock
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              {product.swap_allowed !== false && (
              <button
                onClick={() => setShowSwapModal(true)}
                className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Propose Swap
              </button>
            )}
            </div>

            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                * Prices and availability are subject to change without notice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {product && <ProductReviews productId={product.id} />}

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                Propose a Swap
              </h3>
              <button 
                onClick={() => setShowSwapModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-700/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitSwapRequest} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
                  <input required name="userName" defaultValue={user?.user_metadata?.full_name || ''} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone / WhatsApp</label>
                  <input required name="userPhone" defaultValue={user?.user_metadata?.phone_number || ''} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Describe Your Item</label>
                <textarea required name="description" rows={3} placeholder="Condition, specs, flaws..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white resize-none"></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Upload Images (Max 3)</label>
                <div className="flex gap-3 flex-wrap">
                  {swapImages.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setSwapImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {swapImages.length < 3 && (
                  <div className="mt-3">
                    <ImageUploadButtons onFile={handleSwapUpload} disabled={swapUploading} />
                  </div>
                )}
                {swapUploading && <p className="text-xs text-slate-400 mt-2">Uploading...</p>}
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="submit" disabled={swapUploading} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {swapUploading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
