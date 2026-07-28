import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, Clock, ShoppingBag, Tag, RefreshCw, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  condition?: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessoryImageIndex, setAccessoryImageIndex] = useState(0);

  const accessoryImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop", // Smartwatch
    "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=2071&auto=format&fit=crop", // Keyboard
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=2067&auto=format&fit=crop", // Mouse
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=2070&auto=format&fit=crop", // Monitor
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=2070&auto=format&fit=crop", // Storage
    "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=2070&auto=format&fit=crop"  // Power bank
  ];

  useEffect(() => {
    fetchFeaturedProducts();
    
    // Cycle accessory image every 1 minute
    const interval = setInterval(() => {
      setAccessoryImageIndex((prev) => (prev + 1) % accessoryImages.length);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      if (products) {
        // Categories to feature
        const categories = ['Laptops', 'Phones', 'Audio', 'Accessories'];
        const timeIndex = Math.floor(Date.now() / (30 * 60 * 1000)); // Change every 30 mins

        const selectedProducts = categories.map(cat => {
          // Handle 'Audio' fallback to 'Gadgets' if needed
          const catProducts = products.filter(p => 
            p.category === cat || (cat === 'Audio' && p.category === 'Gadgets')
          );
          
          if (catProducts.length === 0) return null;
          
          // Rotate through products based on time
          const productIndex = timeIndex % catProducts.length;
          return catProducts[productIndex];
        }).filter(Boolean) as Product[];

        setFeaturedProducts(selectedProducts);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      <Helmet>
        <title>John20 Deals | Your Smart Tech Plug</title>
        <meta name="description" content="Discover the latest gadgets, high-performance computers, and premium accessories in Ghana. Quality tech at unbeatable prices." />
        <meta property="og:title" content="John20 Deals | Your Smart Tech Plug" />
        <meta property="og:description" content="Discover the latest gadgets, high-performance computers, and premium accessories in Ghana." />
      </Helmet>
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-900/50 z-10"></div>
        <div className="absolute inset-0 z-0">
           <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop" 
            alt="Tech Background" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-24 lg:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Your Smart <span className="text-blue-500">Tech Plug</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Discover the latest gadgets, high-performance computers, and premium accessories. 
              Quality tech at unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/shop" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                Shop Now <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                to="/shop?category=Deals" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-8 py-3.5 rounded-full font-bold text-lg transition-all"
              >
                View Deals
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Our Services</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need in one place. We offer complete tech solutions for our customers.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full mb-4 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Buy</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Latest gadgets at the best prices</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-full mb-4 text-green-600 dark:text-green-400">
              <Tag className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sell</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Get top value for your old devices</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-full mb-4 text-purple-600 dark:text-purple-400">
              <RefreshCw className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Swap</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Trade-in and upgrade instantly</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-full mb-4 text-orange-600 dark:text-orange-400">
              <Wrench className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Repair</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Expert repair services for your gadgets</p>
          </div>
        </div>
        <div className="mt-8 bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between text-white shadow-lg border border-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="bg-white/10 p-3 rounded-full">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Nationwide Delivery</h4>
              <p className="text-slate-300 text-sm">Fast and secure delivery across Ghana.</p>
            </div>
          </div>
          <Link to="/shop" className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-100 transition-colors whitespace-nowrap">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Shop by Category</h2>
          <Link to="/shop" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Laptops", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop" },
            { name: "Phones", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2080&auto=format&fit=crop" },
            { name: "Audio", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop" },
            { name: "Accessories", img: accessoryImages[accessoryImageIndex] }
          ].map((cat) => (
            <Link 
              key={cat.name} 
              to={`/shop?category=${cat.name}`}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
            >
              <img 
                src={cat.img} 
                alt={cat.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                <h3 className="text-white font-bold text-xl">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Products</h2>
          <Link to="/shop" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 h-80 animate-pulse"></div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  <img 
                    src={product.image_url || 'https://via.placeholder.com/300'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                  <div className="absolute top-3 right-3 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">{product.category}</p>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-lg text-slate-900 dark:text-white">{formatCurrency(product.price)}</span>
                    <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl">
            <p className="text-slate-500 dark:text-slate-400">Check back later for featured products.</p>
          </div>
        )}
      </section>
    </div>
  );
}
