import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { Trash2, Plus, Minus, MessageCircle, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');

  const handleWhatsAppOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      return;
    }

    if (deliveryMethod === 'delivery' && !address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    // 1. Create Order in Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        products: items as any,
        total_price: total,
        status: 'pending',
        delivery_method: deliveryMethod,
        shipping_address: deliveryMethod === 'delivery' ? address : 'Pickup in Store'
      } as any)
      .select()
      .single();

    if (error || !order) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order reference. Please try again.');
      return;
    }

    // 2. Construct WhatsApp Message
    const orderData = order as any;
    const orderRef = orderData.id.slice(0, 8).toUpperCase();
    const customerName = user.user_metadata.full_name || 'Customer';
    
    let message = `Hello John20 Deals, I want to order the following device(s):\n\n`;
    
    items.forEach(item => {
      message += `*${item.name}*\n${item.condition ? `Condition: ${item.condition}\n` : ''}Price: ${formatCurrency(item.price)}\nQuantity: ${item.quantity}\n\n`;
    });
    
    message += `*Total: ${formatCurrency(total)}*\n`;
    message += `Order Ref: #${orderRef}\n`;
    message += `My name: ${customerName}\n`;
    message += `Delivery Method: ${deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup in Store'}\n`;
    if (deliveryMethod === 'delivery') {
      message += `Address: ${address}`;
    }

    // 3. Redirect to WhatsApp
    const adminPhone = '233505694171'; // Updated admin number
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // 4. Clear Cart
    clearCart();
    toast.success('Order initiated! Redirecting to WhatsApp...');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
          <ShoppingCart className="h-12 w-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link 
          to="/shop" 
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet>
        <title>Shopping Cart | John20 Deals</title>
      </Helmet>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 items-center">
              <div className="h-24 w-24 bg-slate-50 dark:bg-slate-800 rounded-xl flex-shrink-0 overflow-hidden">
                <img 
                  src={item.image_url || 'https://placehold.co/600x600/f8fafc/94a3b8?text=Image'} 
                  alt={item.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex-grow">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{item.name}</h3>
                {item.condition && (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {item.condition}
                  </span>
                )}
                <p className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(item.price)}</p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-1">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </button>
                <span className="font-bold text-sm w-4 text-center dark:text-white">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <button 
                onClick={() => removeItem(item.id)}
                className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              
              {/* Delivery Options */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Delivery Method</label>
                <div className="mb-4">
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value as 'delivery' | 'pickup')}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all p-3 text-sm text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <option value="delivery">Delivery (to your address)</option>
                    <option value="pickup">Pickup in Store</option>
                  </select>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Delivery Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full delivery address, including landmarks..."
                      rows={3}
                      className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all p-3 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Delivery Fee</span>
                <span>{deliveryMethod === 'delivery' ? 'Calculated via WhatsApp' : 'Free'}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between font-black text-xl text-slate-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 mb-4"
            >
              <MessageCircle className="h-5 w-5" />
              Order via WhatsApp
            </button>
            
            <p className="text-xs text-center text-slate-400">
              By clicking above, you will be redirected to WhatsApp to finalize your order with our sales team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
