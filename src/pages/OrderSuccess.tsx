import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Tag, Wrench, RefreshCw, MessageCircle, Home, ShoppingCart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface SuccessConfig {
  icon: LucideIcon;
  title: string;
  message: string;
  cta: string;
}

const CONFIG: Record<string, SuccessConfig> = {
  order: {
    icon: ShoppingBag,
    title: 'Thank you for your order!',
    message: 'Your order has been recorded. Our sales team will confirm payment and delivery details with you on WhatsApp shortly.',
    cta: 'Chat with us on WhatsApp',
  },
  sell: {
    icon: Tag,
    title: 'Sell request received!',
    message: 'We will review your device and contact you on WhatsApp with a quote shortly.',
    cta: 'Track it in your dashboard',
  },
  repair: {
    icon: Wrench,
    title: 'Repair booked successfully!',
    message: 'Our technicians will diagnose your device and contact you on WhatsApp with a repair quote.',
    cta: 'Track it in your dashboard',
  },
  swap: {
    icon: RefreshCw,
    title: 'Swap request sent!',
    message: 'Our team will review your trade-in offer and get back to you on WhatsApp.',
    cta: 'Track it in your dashboard',
  },
};

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const type = params.get('type') || 'order';
  const ref = params.get('ref') || '';

  const config = CONFIG[type] || CONFIG.order;
  const Icon = config.icon;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Helmet>
        <title>Order Confirmed | John20 Deals</title>
        <meta name="description" content="Your request has been received. Thank you for choosing John20 Deals." />
      </Helmet>
      <div className="max-w-lg w-full text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto -mt-20 mb-6 border-4 border-white dark:border-slate-900">
          <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">{config.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{config.message}</p>

        {ref && (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 mb-6 inline-block">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Order Ref: </span>
            <span className="font-black text-slate-900 dark:text-white">#{ref}</span>
          </div>
        )}

        <div className="space-y-3">
          <a
            href={`https://wa.me/233505694171${ref ? `?text=Hello John20 Deals, I just placed ${type === 'order' ? 'order' : 'a request'} ref %23${ref}.` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="h-5 w-5" /> {config.cta}
          </a>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              <ShoppingCart className="h-5 w-5" /> Continue Shopping
            </Link>
            <Link
              to={type === 'order' ? '/' : '/profile'}
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <Home className="h-5 w-5" /> {type === 'order' ? 'Home' : 'Dashboard'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
