import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Shield, Truck, CreditCard, RefreshCw, MapPin, Navigation } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../components/Breadcrumbs';
import { WHATSAPP_NUMBER } from '../lib/utils';

export default function Support() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Simply browse our shop, add items to your cart, and checkout. You'll be redirected to WhatsApp to confirm your order, payment, and delivery details with our sales team.",
      icon: HelpCircle
    },
    {
      question: "What are your delivery times?",
      answer: "We typically deliver within 24-48 hours within Accra and 2-3 business days for other regions in Ghana.",
      icon: Truck
    },
    {
      question: "How do I pay?",
      answer: "Orders are confirmed and paid for directly through WhatsApp. Our sales team will arrange the payment method with you after you place your order.",
      icon: CreditCard
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for manufacturer defects. Items must be in their original packaging with all accessories included.",
      icon: RefreshCw
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Help & Support | John20 Deals</title>
        <meta name="description" content="Get help and support for your John20 Deals orders. FAQs, shipping info, and contact details." />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer }
            }))
          })}
        </script>
      </Helmet>
      <Breadcrumbs items={[{ name: 'Help & Support' }]} />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Help & Support</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Everything you need to know about shopping with John20 Deals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="bg-blue-50 dark:bg-blue-900/30 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Shipping</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fast nationwide delivery across Ghana.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="bg-green-50 dark:bg-green-900/30 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Secure</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your data is always protected.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="bg-purple-50 dark:bg-purple-900/30 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Returns</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Easy 7-day returns for defective items.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {faqs.map((faq, idx) => (
            <div key={idx} className="group">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                    <faq.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{faq.question}</span>
                </div>
                {openIndex === idx ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6 pl-16">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Find Us / Directions */}
      <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Find Us
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">We're based in the Accra - Tema corridor. Visit us for pickup, trade-ins, or repairs.</p>
        </div>
        <div className="p-6">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-6">
            <iframe
              title="John20 Deals location - Accra, Ghana"
              src="https://www.google.com/maps?q=Accra%2C+Ghana&z=11&output=embed"
              width="100%"
              height="320"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Accra%2C+Ghana"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Navigation className="h-5 w-5" /> Get Directions
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              WhatsApp Us For Exact Location
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-blue-600 rounded-3xl p-8 text-center text-white shadow-xl shadow-blue-600/20">
        <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
        <p className="text-blue-100 mb-6">We're available 24/7 on WhatsApp to assist you.</p>
        <a 
          href={`https://wa.me/${WHATSAPP_NUMBER}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all"
        >
          Chat with us
        </a>
      </div>
    </div>
  );
}
