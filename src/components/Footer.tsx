import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Laptop, Mail, Phone, MapPin, Send, Ghost } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          toast.success('You are already subscribed!');
        } else {
          throw error;
        }
      } else {
        toast.success('Successfully subscribed to newsletter!');
      }
      setEmail('');
    } catch (error: any) {
      console.error('Newsletter error:', error);
      toast.error('Failed to subscribe. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.svg" alt="John20 Deals Logo" className="h-10 w-auto bg-white p-1 rounded" />
              <span className="text-xl font-bold tracking-tight">John20 Deals</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your Smart Tech Plug. We provide high-quality gadgets, computers, and accessories to power your digital life.
            </p>
            <div className="flex gap-4">
              <a href="https://snapchat.com/add/john_darkwah20" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors">
                <Ghost className="h-5 w-5" />
                <span className="text-sm">john_darkwah20</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-slate-200">Quick Links</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Latest Laptops</Link></li>
              <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Smartphones</Link></li>
              <li><Link to="/support" className="hover:text-blue-400 transition-colors">Help & Support</Link></li>
              <li><Link to="/support" className="hover:text-blue-400 transition-colors">Return Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-slate-200">Contact Us</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                <span>Accra - Tema</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                <span>0554831090</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                <span>johndarkwah20@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-slate-200">Newsletter</h4>
            <p className="text-sm text-slate-400 mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800 border-none rounded-lg text-sm px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 text-white"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Join'}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} John20 Deals. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="https://wa.me/233554831090" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors font-bold text-green-500">Chat with us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
