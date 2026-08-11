import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShoppingBag, Tag, RefreshCw, Wrench, Briefcase, Smartphone, Hammer } from 'lucide-react';
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
  swap_allowed?: boolean;
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

      if (products && products.length > 0) {
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
      } else {
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.warn('Error fetching featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <Helmet>
        <title>John20 Deals | Your Smart Tech Plug</title>
        <meta name="description" content="Discover the latest gadgets, high-performance computers, and premium accessories in Ghana. Quality tech at unbeatable prices." />
        <meta property="og:title" content="John20 Deals | Your Smart Tech Plug" />
        <meta property="og:description" content="Discover the latest gadgets, high-performance computers, and premium accessories in Ghana." />
        <meta property="og:image" content="https://john20deals.vercel.app/logo.svg" />
      </Helmet>
      {/* Our Services */}
      <section className="relative py-16 overflow-hidden bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" 
            alt="Gadgets Background" 
            className="w-full h-full object-cover opacity-[0.04] dark:opacity-[0.07]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-transparent to-slate-50 dark:from-slate-950/50 dark:to-slate-950"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">All in One <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Tech Plug</span></h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
              Discover the latest gadgets, high-performance computers, and premium accessories. Quality tech at unbeatable prices.
            </p>
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-5">
            <Link 
              to="/shop"
              className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 p-5 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full mb-4 text-blue-600 dark:text-blue-400">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Buy</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Latest gadgets at best prices</p>
            </Link>
            <Link 
              to="/sell"
              className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 p-5 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-full mb-4 text-green-600 dark:text-green-400">
                <Tag className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sell</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Top value for old devices</p>
            </Link>
            <Link 
              to="/shop?swap=1"
              className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 p-5 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-full mb-4 text-purple-600 dark:text-purple-400">
                <RefreshCw className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Swap</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Trade-in & upgrade instantly</p>
            </Link>
            <Link 
              to="/repair"
              className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 p-5 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-full mb-4 text-orange-600 dark:text-orange-400">
                <Wrench className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Repair</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Expert repair services</p>
            </Link>
          </div>

          {/* Mobile Marquee */}
          <div className="md:hidden relative w-full overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 dark:from-[#0b1120] z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 dark:from-[#0b1120] z-10 pointer-events-none"></div>
            <div className="flex w-max animate-marquee py-2">
              {[0, 1].map((set) => (
                <div key={set} className="flex gap-3 pr-3 w-max">
                  {[
                    { icon: ShoppingBag, title: 'Buy', desc: 'Latest gadgets', color: 'blue', to: '/shop' },
                    { icon: Tag, title: 'Sell', desc: 'Top value', color: 'green', to: '/sell' },
                    { icon: RefreshCw, title: 'Swap', desc: 'Trade-in easily', color: 'purple', to: '/shop?swap=1' },
                    { icon: Wrench, title: 'Repair', desc: 'Expert services', color: 'orange', to: '/repair' },
                  ].map((item, idx) => (
                    <Link 
                      key={idx}
                      to={item.to}
                      className="w-[140px] shrink-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 p-4 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center text-center"
                    >
                      <div className={`p-3 rounded-full mb-3 ${
                        item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        item.color === 'green' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        item.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                        'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      }`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between text-white shadow-lg border border-slate-800 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            <div className="flex items-center gap-4 mb-4 sm:mb-0 relative z-10">
              <div className="bg-white/10 p-3 rounded-full">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Nationwide Delivery</h4>
                <p className="text-slate-300 text-sm">Fast and secure delivery across Ghana.</p>
              </div>
            </div>
            <Link to="/shop" className="relative z-10 bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-100 transition-colors whitespace-nowrap">
              Shop Now
            </Link>
          </div>
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
                <h3 className="text-white font-bold text-lg">{cat.name}</h3>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 h-64 animate-pulse"></div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  <img 
                    src={product.image_url || 'https://placehold.co/600x600/f8fafc/94a3b8?text=Image'} 
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

      {/* Success Stories / Case Studies (marquee) */}
      <section className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Real Success Stories</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">See how customers buy, sell, swap, and repair with John20 Deals.</p>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 dark:from-slate-950 z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 dark:from-slate-950 z-10 pointer-events-none"></div>
          <div className="flex w-max animate-marquee py-2">
            {[0, 1].map((set) => (
              <div key={set} className="flex gap-5 pr-5 w-max">
                {[
                  {
                    tag: 'Sell',
                    icon: Briefcase,
                    quote: 'I sold my two-year-old laptop and got top value within days. The team tested it, paid me, and the whole process was stress-free.',
                    name: 'Kwame A.',
                    detail: 'Sold a gently used laptop from Tema',
                  },
                  {
                    tag: 'Swap',
                    icon: Smartphone,
                    quote: 'Traded in my old phone for a newer model and only paid the difference. The trade-in value offered was way better than anywhere else.',
                    name: 'Ama B.',
                    detail: 'Upgraded her smartphone via Swap',
                  },
                  {
                    tag: 'Repair',
                    icon: Hammer,
                    quote: 'Cracked screen fixed in under 24 hours. My device was delivered back to me looking brand new, with a clear upfront quote.',
                    name: 'Kojo D.',
                    detail: 'Got a same-week screen repair in Accra',
                  },
                  {
                    tag: 'Sell',
                    icon: Briefcase,
                    quote: 'Traded in my PlayStation and accessories for top store credit. Seamless and professional from start to finish.',
                    name: 'Esi M.',
                    detail: 'Turned old console into store credit',
                  },
                  {
                    tag: 'Repair',
                    icon: Hammer,
                    quote: 'Battery replaced on my laptop in hours. The shop even followed up after delivery to make sure everything was working.',
                    name: 'Nana K.',
                    detail: 'Quick battery replacement in Accra',
                  },
                ].map((story) => (
                  <div key={story.name} className="w-[320px] sm:w-[380px] shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex gap-4 items-start hover:shadow-lg transition-shadow">
                    <span className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                      story.tag === 'Sell' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      story.tag === 'Swap' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                      'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    }`}>
                      <story.icon className="h-6 w-6" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          story.tag === 'Sell' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          story.tag === 'Swap' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {story.tag}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{story.name}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">"{story.quote}"</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{story.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
