import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Shield, Truck, CreditCard, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Support() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Simply browse our shop, add items to your cart, and proceed to checkout. You can pay via Mobile Money or Card, and we'll contact you on WhatsApp to confirm delivery details.",
      icon: HelpCircle
    },
    {
      question: "What are your delivery times?",
      answer: "We typically deliver within 24-48 hours within Accra and 2-3 business days for other regions in Ghana.",
      icon: Truck
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major Mobile Money networks (MTN, Telecel, AT) and Debit/Credit cards through our secure payment partner.",
      icon: CreditCard
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for manufacturer defects. Items must be in their original packaging with all accessories included.",
      icon: RefreshCw
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Help & Support | John20 Deals</title>
        <meta name="description" content="Get help and support for your John20 Deals orders. FAQs, shipping info, and contact details." />
      </Helmet>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Help & Support</h1>
        <p className="text-slate-500 text-lg">Everything you need to know about shopping with John20 Deals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Shipping</h3>
          <p className="text-sm text-slate-500">Fast nationwide delivery across Ghana.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Secure</h3>
          <p className="text-sm text-slate-500">Your data and payments are always protected.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Returns</h3>
          <p className="text-sm text-slate-500">Easy 7-day returns for defective items.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="group">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-white transition-colors">
                    <faq.icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <span className="font-bold text-slate-900">{faq.question}</span>
                </div>
                {openIndex === idx ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6 pl-16">
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-blue-600 rounded-3xl p-8 text-center text-white shadow-xl shadow-blue-600/20">
        <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
        <p className="text-blue-100 mb-6">We're available 24/7 on WhatsApp to assist you.</p>
        <a 
          href="https://wa.me/233505694171" 
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
