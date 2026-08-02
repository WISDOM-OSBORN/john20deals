import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Package, ShoppingBag, DollarSign, Upload, Tag, Info, Layers, X, CheckCircle, Clock, User, MapPin, Truck, RefreshCw, Wrench, MessageCircle, Search } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import { createNotification } from '../lib/notifications';
import StatCard from '../components/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  condition?: string;
  swap_allowed?: boolean;
  stock: number;
  image_url: string | null;
  image_url_2?: string | null;
  description: string | null;
}

interface Order {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  user_id: string;
  products?: any[];
  delivery_method?: string;
  shipping_address?: string;
}

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  total_spend: number;
  order_count: number;
  last_order: string | null;
}

interface SwapRequest {
  id: string;
  created_at: string;
  status: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  product_name: string;
  offer_description: string;
  image_url_1: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  trade_in_value?: number | null;
  cash_difference?: number | null;
  terms?: string | null;
  notified_at?: string | null;
}

interface SellRequest {
  id: string;
  created_at: string;
  status: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  device_type: string | null;
  brand: string | null;
  model: string | null;
  condition: string | null;
  description: string | null;
  offer_price: number | null;
  image_url_1: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
}

interface RepairRequest {
  id: string;
  created_at: string;
  status: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  device_type: string | null;
  issue_description: string | null;
  image_url_1: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  diagnosis: string | null;
  repair_cost: number | null;
  estimated_completion: string | null;
  completed_at: string | null;
  decline_reason: string | null;
  cancelled_at: string | null;
  admin_notes: string | null;
}

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'newsletter' | 'customers' | 'analytics' | 'swaps' | 'sell' | 'repair'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Swap Accept Modal State
  const [acceptingSwap, setAcceptingSwap] = useState<SwapRequest | null>(null);
  const [acceptTradeIn, setAcceptTradeIn] = useState('');
  const [acceptCashDiff, setAcceptCashDiff] = useState('');
  const [acceptTerms, setAcceptTerms] = useState('');
  const [savingSwap, setSavingSwap] = useState(false);

  // Repair Diagnose Modal State
  const [diagnosingRepair, setDiagnosingRepair] = useState<RepairRequest | null>(null);
  const [diagDiagnosis, setDiagDiagnosis] = useState('');
  const [diagCost, setDiagCost] = useState('');
  const [diagEta, setDiagEta] = useState('');
  const [savingDiagnosis, setSavingDiagnosis] = useState(false);

  // Analytics State
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Newsletter State

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data: profilesData } = await supabase.from('profiles').select('*');
    const { data: subscribersData } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    const { data: swapData } = await supabase.from('swap_requests').select('*').order('created_at', { ascending: false });
    const { data: sellData } = await supabase.from('sell_requests').select('*').order('created_at', { ascending: false });
    const { data: repairData } = await supabase.from('repair_requests').select('*').order('created_at', { ascending: false });
    
    if (productsData) setProducts(productsData);
    if (subscribersData) setSubscribers(subscribersData);
      if (swapData) setSwapRequests(swapData as SwapRequest[]);
    if (sellData) setSellRequests(sellData as SellRequest[]);
    if (repairData) setRepairRequests(repairData as RepairRequest[]);
    if (ordersData) {
      setOrders(ordersData);
      
      // Prepare sales data for charts
      const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const dailySales = last30Days.map(date => {
        const dayOrders = ordersData.filter(o => o.created_at.startsWith(date) && o.status !== 'cancelled');
        return {
          date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          amount: dayOrders.reduce((acc, o) => acc + o.total_price, 0),
          orders: dayOrders.length
        };
      });
      setSalesData(dailySales);

      // Category data
      if (productsData) {
        const catStats = productsData.reduce((acc: any, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {});
        setCategoryData(Object.entries(catStats).map(([name, value]) => ({ name, value })));
      }
      
      // Calculate customer stats
      if (profilesData) {
        const customerStats = profilesData.map(profile => {
          const userOrders = ordersData.filter(o => o.user_id === profile.id);
          const totalSpend = userOrders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total_price, 0);
          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            total_spend: totalSpend,
            order_count: userOrders.length,
            last_order: userOrders[0]?.created_at || null
          };
        }).sort((a, b) => b.total_spend - a.total_spend);
        setCustomers(customerStats);
      }
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageIndex: 1 | 2 = 1) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File is too large. Maximum size is 10 MB.');
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG, PNG, WEBP and GIF images are allowed.');
      }
      
      // 1. Get presigned URL from our backend
      const apiEndpoint = import.meta.env.PROD ? '/.netlify/functions/upload-url' : '/api/upload';
      const urlResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          expectedSize: file.size
        }),
      });

      if (!urlResponse.ok) {
        let errorMessage = 'Failed to get upload URL';
        try {
          const errorData = await urlResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server returned ${urlResponse.status}: ${urlResponse.statusText}. Please check if the function is deployed correctly.`;
        }
        throw new Error(errorMessage);
      }

      let uploadUrl, publicUrl;
      try {
        const data = await urlResponse.json();
        uploadUrl = data.uploadUrl;
        publicUrl = data.publicUrl;
      } catch (e) {
        throw new Error('Server returned an invalid response. Ensure the backend function is deployed correctly.');
      }

      // 2. Upload directly to Cloudflare R2 using the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed status ${uploadResponse.status}: ${errorText}`);
      }

      if (imageIndex === 1) {
        setImageUrl(publicUrl);
      } else {
        setImageUrl2(publicUrl);
      }
      toast.success(`Image ${imageIndex} uploaded successfully!`);
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted');
      fetchData();
    }
  };

  const openAcceptSwap = (swap: SwapRequest) => {
    setAcceptingSwap(swap);
    setAcceptTradeIn(swap.trade_in_value != null ? String(swap.trade_in_value) : '');
    setAcceptCashDiff(swap.cash_difference != null ? String(swap.cash_difference) : '');
    setAcceptTerms(swap.terms || '');
  };

  const openWhatsApp = (phone: string | null, messageLines: string[]) => {
    const phoneNum = (phone || '').replace(/[^+\d]/g, '');
    if (!phoneNum) {
      toast.error('No phone number on record');
      return;
    }
    const whatsappUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(messageLines.join('\n'))}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAcceptSwap = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptingSwap) return;
    setSavingSwap(true);

    const tradeInValue = acceptTradeIn ? parseFloat(acceptTradeIn) : null;
    const cashDifference = acceptCashDiff ? parseFloat(acceptCashDiff) : null;

    const { error } = await supabase
      .from('swap_requests')
      .update({
        status: 'accepted',
        trade_in_value: tradeInValue,
        cash_difference: cashDifference,
        terms: acceptTerms.trim() || null,
        notified_at: new Date().toISOString(),
      })
      .eq('id', acceptingSwap.id);

    setSavingSwap(false);

    if (error) {
      toast.error('Failed to accept swap');
      return;
    }

    toast.success('Swap accepted');
    setAcceptingSwap(null);
    fetchData();

    await createNotification({
      userId: acceptingSwap.user_id,
      type: 'swap',
      title: 'Swap accepted!',
      message: `Your swap request for ${acceptingSwap.product_name} has been accepted. We've sent the details to your WhatsApp.`,
    });

    const messageLines = [
      `Hello ${acceptingSwap.user_name || 'there'}!`,
      `Great news — your swap request for *${acceptingSwap.product_name}* at John20 Deals has been *accepted*!`,
    ];
    if (tradeInValue != null) {
      messageLines.push(`Trade-in value for your device: *GH₵ ${tradeInValue.toLocaleString()}*`);
    }
    if (cashDifference != null) {
      messageLines.push(`Cash difference to complete the swap: *GH₵ ${cashDifference.toLocaleString()}*`);
    }
    if (acceptTerms.trim()) {
      messageLines.push(`Terms: ${acceptTerms.trim()}`);
    }
    messageLines.push('Reply to this message or visit our shop to proceed. Thank you!');
    openWhatsApp(acceptingSwap.user_phone, messageLines);
  };

  const openDiagnoseRepair = (repair: RepairRequest) => {
    setDiagnosingRepair(repair);
    setDiagDiagnosis(repair.diagnosis || '');
    setDiagCost(repair.repair_cost != null ? String(repair.repair_cost) : '');
    setDiagEta(repair.estimated_completion ? repair.estimated_completion.slice(0, 10) : '');
  };

  const handleSaveDiagnosis = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!diagnosingRepair) return;
    setSavingDiagnosis(true);

    const cost = diagCost ? parseFloat(diagCost) : null;
    const eta = diagEta ? new Date(diagEta).toISOString() : null;

    const { error } = await supabase
      .from('repair_requests')
      .update({
        status: 'diagnosed',
        diagnosis: diagDiagnosis.trim() || null,
        repair_cost: cost,
        estimated_completion: eta,
      })
      .eq('id', diagnosingRepair.id);

    setSavingDiagnosis(false);
    if (error) {
      toast.error('Failed to save diagnosis');
      return;
    }

    toast.success('Diagnosis saved & status updated');
    const saved = diagnosingRepair;
    setDiagnosingRepair(null);
    fetchData();

    await createNotification({
      userId: saved.user_id,
      type: 'repair',
      title: 'Repair diagnosed!',
      message: `We've diagnosed your ${saved.device_type || 'device'}.${cost != null ? ` Estimated cost: ${formatCurrency(cost)}.` : ''}`,
    });

    openWhatsApp(saved.user_phone, [
      `Hello ${saved.user_name || 'there'}!`,
      `We've diagnosed your *${saved.device_type || 'device'}*:`,
      diagDiagnosis.trim() || 'Diagnosis complete.',
      cost != null ? `Estimated repair cost: *${formatCurrency(cost)}*` : '',
      eta ? `Expected completion: *${new Date(eta).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}*` : '',
      'Reply to this message to approve the repair. Thank you!',
    ].filter(Boolean));
  };

  const handleDeclineRepair = async (repair: RepairRequest, reason: string) => {
    const { error } = await supabase
      .from('repair_requests')
      .update({ status: 'declined', decline_reason: reason.trim() || null })
      .eq('id', repair.id);
    if (error) {
      toast.error('Failed to decline request');
      return;
    }
    toast.success('Repair declined');
    await createNotification({
      userId: repair.user_id,
      type: 'repair',
      title: 'Repair request declined',
      message: `We're sorry, we couldn't repair your ${repair.device_type || 'device'} this time.`,
    });
    openWhatsApp(repair.user_phone, [
      `Hello ${repair.user_name || 'there'}!`,
      `We're sorry — we couldn't repair your *${repair.device_type || 'device'}* this time.`,
      reason.trim() ? `Reason: ${reason.trim()}` : '',
      'You are welcome to contact us anytime. Thank you!',
    ].filter(Boolean));
    fetchData();
  };

  const handleRepairStatusChange = async (repair: RepairRequest, newStatus: string) => {
    if (newStatus === 'declined') {
      const reason = window.prompt(`Reason for declining ${repair.device_type || 'this device'} repair?`, '');
      if (reason === null) return;
      await handleDeclineRepair(repair, reason || '');
      return;
    }

    const { error } = await supabase
      .from('repair_requests')
      .update({ status: newStatus })
      .eq('id', repair.id);
    if (error) {
      toast.error('Failed to update status');
      return;
    }
    toast.success('Status updated');

    if (newStatus === 'ready_for_pickup') {
      await createNotification({
        userId: repair.user_id,
        type: 'repair',
        title: 'Repair complete!',
        message: `Your ${repair.device_type || 'device'} is repaired and ready for pickup.`,
      });
      openWhatsApp(repair.user_phone, [
        `Hello ${repair.user_name || 'there'}!`,
        `Good news — your ${repair.device_type || 'device'} has been *repaired* and is ready for pickup at John20 Deals!`,
        repair.repair_cost != null ? `Total cost: *${formatCurrency(repair.repair_cost)}*` : '',
        'Reply to this message or visit our shop to collect it. Thank you!',
      ].filter(Boolean));
    } else if (newStatus === 'picked_up') {
      await createNotification({
        userId: repair.user_id,
        type: 'repair',
        title: 'Pickup confirmed!',
        message: `We've confirmed pickup of your ${repair.device_type || 'device'}. Thank you for choosing John20 Deals!`,
      });
    }
    fetchData();
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      condition: formData.get('condition') as string || 'New',
      description: formData.get('description') as string,
      image_url: imageUrl || (formData.get('image_url') as string),
      image_url_2: imageUrl2 || (formData.get('image_url_2') as string) || null,
      stock: parseInt(formData.get('stock') as string) || 0,
      swap_allowed: formData.get('swap_allowed') === 'on',
    };

    let error;
    if (isEditing && currentProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData as any)
        .eq('id', currentProduct.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert(productData as any);
      error = insertError;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isEditing ? 'Product updated' : 'Product added');
      setShowForm(false);
      setIsEditing(false);
      setCurrentProduct(null);
      setImageUrl('');
      setImageUrl2('');
      fetchData();
    }
  };

  const openEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setImageUrl(product.image_url || '');
    setImageUrl2(product.image_url_2 || '');
    setIsEditing(true);
    setShowForm(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus } as any)
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        const messages: Record<string, string> = {
          paid: 'Your payment has been confirmed. We are preparing your order.',
          delivered: 'Your order has been delivered. Enjoy!',
          cancelled: 'Your order was cancelled.',
        };
        const titleMap: Record<string, string> = {
          paid: 'Payment confirmed',
          delivered: 'Order delivered',
          cancelled: 'Order cancelled',
        };
        if (messages[newStatus]) {
          await createNotification({
            userId: order.user_id,
            type: 'order',
            title: titleMap[newStatus] || 'Order update',
            message: messages[newStatus],
          });
        }
      }
      fetchData();
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-800/50';
      case 'paid':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800/50';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800/50';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800/50';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  if (authLoading) return <div className="p-8">Loading...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet>
        <title>Admin Dashboard | John20 Deals</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <button 
          onClick={() => {
            setIsEditing(false);
            setCurrentProduct(null);
            setImageUrl('');
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus className="h-5 w-5" /> Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <StatCard
          label="Total Products"
          value={products.length}
          icon={<Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          accent="bg-blue-50 dark:bg-blue-900/30"
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={<ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />}
          accent="bg-green-50 dark:bg-green-900/30"
        />
        <StatCard
          label="Revenue (Est)"
          value={formatCurrency(orders.filter(o => o.status !== 'cancelled').reduce((acc, order) => acc + order.total_price, 0))}
          icon={<DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
          accent="bg-purple-50 dark:bg-purple-900/30"
        />
        <StatCard
          label="Pending Orders"
          value={orders.filter(o => o.status === 'pending').length}
          icon={<Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
          accent="bg-yellow-50 dark:bg-yellow-900/30"
        />
        <StatCard
          label="Delivered"
          value={orders.filter(o => o.status === 'delivered').length}
          icon={<CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
          accent="bg-emerald-50 dark:bg-emerald-900/30"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'products' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'orders' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('swaps')}
          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'swaps' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Swaps
          {swapRequests.filter(s => s.status === 'pending').length > 0 && (
            <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 py-0.5 px-2 rounded-full text-xs font-bold">
              {swapRequests.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'sell' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Sell Requests
          {sellRequests.filter(s => s.status === 'pending').length > 0 && (
            <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 py-0.5 px-2 rounded-full text-xs font-bold">
              {sellRequests.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('repair')}
          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'repair' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Repair Requests
          {repairRequests.filter(r => r.status === 'received').length > 0 && (
            <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 py-0.5 px-2 rounded-full text-xs font-bold">
              {repairRequests.filter(r => r.status === 'received').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'customers' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Customers
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'analytics' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('newsletter')}
          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'newsletter' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Subscribers
        </button>
      </div>

      {/* Content */}
      {activeTab === 'products' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-400"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Product Name</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Category</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Condition</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Price</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Stock</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.filter((p) =>
                !productSearch.trim() ||
                p.name.toLowerCase().includes(productSearch.trim().toLowerCase()) ||
                (p.category || '').toLowerCase().includes(productSearch.trim().toLowerCase())
              ).map((product) => (
                <tr key={product.id} onClick={() => openEditProduct(product)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    {product.image_url && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{product.name}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                      {product.condition || 'New'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-900 dark:text-white font-black">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 5 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => openEditProduct(product)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Order ID</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Date</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Total</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">
                    <span className="text-blue-600 dark:text-blue-400">#</span>{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400 font-medium">
                    {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-3 text-slate-900 dark:text-white font-black">{formatCurrency(order.total_price)}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 transition-all ${getStatusStyles(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {order.status === 'pending' && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                      title="View Order Details"
                    >
                      <Package className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                      title="Cancel Order"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : activeTab === 'analytics' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white">Revenue Trend (Last 30 Days)</h3>
                <DollarSign className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      minTickGap={30}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickFormatter={(value) => `₵${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white">Order Volume</h3>
                <ShoppingBag className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      minTickGap={30}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Product Distribution by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{cat.name}</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{cat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'customers' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Orders</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Total Spend</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Last Order</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                        {customer.full_name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{customer.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{customer.order_count} orders</span>
                  </td>
                  <td className="px-6 py-3 text-slate-900 dark:text-white font-black">{formatCurrency(customer.total_spend)}</td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400 font-medium">
                    {customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {customer.total_spend > 5000 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 uppercase tracking-tighter">
                        VIP
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                        Regular
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : activeTab === 'newsletter' ? (
        <div className="grid grid-cols-1 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">Newsletter Subscribers</h3>
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                  {subscribers.length} Subscribers
                </span>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Email Address</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Joined Date</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                          No subscribers yet.
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{sub.email}</td>
                          <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button 
                              onClick={async () => {
                                if (confirm('Remove this subscriber?')) {
                                  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', sub.id);
                                  if (error) toast.error('Failed to remove subscriber');
                                  else {
                                    toast.success('Subscriber removed');
                                    fetchData();
                                  }
                                }
                              }}
                              className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>


        </div>
      ) : activeTab === 'swaps' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              Swap Requests
            </h3>
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
              {swapRequests.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Date</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Store Product</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Offer Details</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {swapRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      <RefreshCw className="h-8 w-8 mx-auto mb-3 opacity-20" />
                      No swap requests found.
                    </td>
                  </tr>
                ) : (
                  swapRequests.map((swap) => (
                    <tr key={swap.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {new Date(swap.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">{swap.user_name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{swap.user_phone}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900 dark:text-white max-w-[150px] truncate">{swap.product_name}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate mb-2">
                          {swap.offer_description}
                        </div>
                        <div className="flex gap-2">
                          {swap.image_url_1 && (
                            <a href={swap.image_url_1} target="_blank" rel="noopener noreferrer">
                              <img src={swap.image_url_1} className="w-8 h-8 object-cover rounded-md border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform" />
                            </a>
                          )}
                          {swap.image_url_2 && (
                            <a href={swap.image_url_2} target="_blank" rel="noopener noreferrer">
                              <img src={swap.image_url_2} className="w-8 h-8 object-cover rounded-md border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform" />
                            </a>
                          )}
                          {swap.image_url_3 && (
                            <a href={swap.image_url_3} target="_blank" rel="noopener noreferrer">
                              <img src={swap.image_url_3} className="w-8 h-8 object-cover rounded-md border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          swap.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          swap.status === 'reviewed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          swap.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        } border`}>
                          {swap.status === 'accepted' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {swap.status}
                        </span>
                        {swap.status === 'accepted' && swap.trade_in_value != null && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Trade-in: {formatCurrency(swap.trade_in_value)}</p>
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        {swap.status === 'accepted' ? (
                          <button
                            onClick={() => openWhatsApp(
                              swap.user_phone,
                              [
                                `Hello ${swap.user_name || 'there'}!`,
                                `Your swap request for *${swap.product_name}* at John20 Deals is *accepted*!`,
                                swap.trade_in_value != null ? `Trade-in value for your device: *GH₵ ${swap.trade_in_value.toLocaleString()}*` : '',
                                swap.cash_difference != null ? `Cash difference to complete the swap: *GH₵ ${swap.cash_difference.toLocaleString()}*` : '',
                                swap.terms ? `Terms: ${swap.terms}` : '',
                                'Reply to this message or visit our shop to proceed. Thank you!',
                              ].filter(Boolean)
                            )}
                            className="mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
                            title="Re-send WhatsApp notification"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                          </button>
                        ) : swap.status === 'declined' ? null : (
                          <>
                            <button
                              onClick={() => openAcceptSwap(swap)}
                              className="mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Accept
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Decline swap request from ${swap.user_name}?`)) {
                                  const { error } = await supabase.from('swap_requests').update({ status: 'declined' }).eq('id', swap.id);
                                  if (error) toast.error('Failed to decline request');
                                  else {
                                    toast.success('Swap declined');
                                    await createNotification({
                                      userId: swap.user_id,
                                      type: 'swap',
                                      title: 'Swap declined',
                                      message: `We're sorry, your swap request for ${swap.product_name} was not accepted this time.`,
                                    });
                                    openWhatsApp(
                                      swap.user_phone,
                                      [
                                        `Hello ${swap.user_name || 'there'}!`,
                                        `We're sorry — your swap request for *${swap.product_name}* at John20 Deals was not accepted this time.`,
                                        'You are welcome to try another device or contact us anytime. Thank you!',
                                      ]
                                    );
                                    fetchData();
                                  }
                                }
                              }}
                              className="mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                            >
                              <X className="h-3.5 w-3.5" /> Decline
                            </button>
                          </>
                        )}
                        <button
                           onClick={async () => {
                            if (confirm('Delete this swap request?')) {
                              const { error } = await supabase.from('swap_requests').delete().eq('id', swap.id);
                              if (error) toast.error('Failed to delete request');
                              else {
                                toast.success('Request deleted');
                                fetchData();
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 transition-colors p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'sell' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              Sell Requests
            </h3>
            <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
              {sellRequests.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Date</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Device</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Offer Price</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Details</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sellRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      <Tag className="h-8 w-8 mx-auto mb-3 opacity-20" />
                      No sell requests found.
                    </td>
                  </tr>
                ) : (
                  sellRequests.map((sell) => (
                    <tr key={sell.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {new Date(sell.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">{sell.user_name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{sell.user_phone}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900 dark:text-white max-w-[150px] truncate">
                          {[sell.brand, sell.model].filter(Boolean).join(' ') || sell.device_type || '—'}
                        </div>
                        {sell.condition && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{sell.condition}</div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-slate-900 dark:text-white font-black whitespace-nowrap">
                        {sell.offer_price ? formatCurrency(sell.offer_price) : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate mb-2">
                          {sell.description}
                        </div>
                        <div className="flex gap-2">
                          {[sell.image_url_1, sell.image_url_2, sell.image_url_3].filter(Boolean).map((img, i) => (
                            <a key={i} href={img!} target="_blank" rel="noopener noreferrer">
                              <img src={img!} className="w-8 h-8 object-cover rounded-md border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform" />
                            </a>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <select
                          value={sell.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            const { error } = await supabase.from('sell_requests').update({ status: newStatus }).eq('id', sell.id);
                            if (error) toast.error('Failed to update status');
                            else {
                              toast.success('Status updated');
                              if (newStatus === 'purchased') {
                                await createNotification({
                                  userId: sell.user_id,
                                  type: 'sell',
                                  title: 'Device purchased!',
                                  message: `Good news! We've purchased your ${[sell.brand, sell.model].filter(Boolean).join(' ') || sell.device_type || 'device'}${sell.offer_price ? ` for ${formatCurrency(sell.offer_price)}` : ''}.`,
                                });
                              } else if (newStatus === 'declined') {
                                await createNotification({
                                  userId: sell.user_id,
                                  type: 'sell',
                                  title: 'Sell request declined',
                                  message: `We're sorry, your sell request for ${[sell.brand, sell.model].filter(Boolean).join(' ') || sell.device_type || 'your device'} was not accepted this time.`,
                                });
                              }
                              fetchData();
                            }
                          }}
                          className={`text-xs font-bold rounded-full px-3 py-1 outline-none cursor-pointer appearance-none border ${
                            sell.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            sell.status === 'contacted' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            sell.status === 'purchased' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="purchased">Purchased</option>
                          <option value="declined">Declined</option>
                        </select>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        {sell.status === 'purchased' && (
                          <button
                            onClick={() => openWhatsApp(
                              sell.user_phone,
                              [
                                `Hello ${sell.user_name || 'there'}!`,
                                `Great news — we've *purchased* your ${[sell.brand, sell.model].filter(Boolean).join(' ') || sell.device_type || 'device'}${sell.offer_price ? ` for *GH₵ ${sell.offer_price.toLocaleString()}*` : ''}!`,
                                'Reply to this message to arrange payment and delivery. Thank you!',
                              ]
                            )}
                            className="mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
                            title="Send WhatsApp notification"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (confirm('Delete this sell request?')) {
                              const { error } = await supabase.from('sell_requests').delete().eq('id', sell.id);
                              if (error) toast.error('Failed to delete request');
                              else {
                                toast.success('Request deleted');
                                fetchData();
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 transition-colors p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'repair' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-500" />
              Repair Requests
            </h3>
            <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
              {repairRequests.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Date</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Device</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Issue</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {repairRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      <Wrench className="h-8 w-8 mx-auto mb-3 opacity-20" />
                      No repair requests found.
                    </td>
                  </tr>
                ) : (
                  repairRequests.map((repair) => (
                    <tr key={repair.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {new Date(repair.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">{repair.user_name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{repair.user_phone}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900 dark:text-white max-w-[150px] truncate">
                          {repair.device_type || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate mb-2">
                          {repair.issue_description}
                        </div>
                        <div className="flex gap-2">
                          {[repair.image_url_1, repair.image_url_2, repair.image_url_3].filter(Boolean).map((img, i) => (
                            <a key={i} href={img!} target="_blank" rel="noopener noreferrer">
                              <img src={img!} className="w-8 h-8 object-cover rounded-md border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform" />
                            </a>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <select
                          value={repair.status}
                          onChange={(e) => handleRepairStatusChange(repair, e.target.value)}
                          className={`text-xs font-bold rounded-full px-3 py-1 outline-none cursor-pointer appearance-none border ${
                            repair.status === 'received' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            repair.status === 'diagnosed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            repair.status === 'in_progress' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            repair.status === 'ready_for_pickup' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            repair.status === 'picked_up' ? 'bg-green-100 text-green-700 border-green-200' :
                            repair.status === 'cancelled_by_user' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="received">Received</option>
                          <option value="diagnosed">Diagnosed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="ready_for_pickup">Ready for Pickup</option>
                          <option value="picked_up">Picked Up</option>
                          <option value="declined">Declined</option>
                        </select>
                        {repair.diagnosis && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-[160px] truncate" title={repair.diagnosis || ''}>
                            {repair.diagnosis}
                          </p>
                        )}
                        {repair.repair_cost != null && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                            Cost: {formatCurrency(repair.repair_cost)}
                          </p>
                        )}
                        {repair.estimated_completion && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            ETA: {new Date(repair.estimated_completion).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                        {repair.status === 'declined' && repair.decline_reason && (
                          <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 max-w-[160px] truncate" title={repair.decline_reason || ''}>
                            Reason: {repair.decline_reason}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        {(repair.status === 'received' || repair.status === 'diagnosed') && (
                          <button
                            onClick={() => openDiagnoseRepair(repair)}
                            className="mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                            title={repair.status === 'diagnosed' ? 'Update diagnosis / quote' : 'Diagnose and set quote'}
                          >
                            <Wrench className="h-3.5 w-3.5" /> {repair.status === 'diagnosed' ? 'Update' : 'Diagnose'}
                          </button>
                        )}
                        {repair.status === 'diagnosed' && (
                          <button
                            onClick={() => openWhatsApp(
                              repair.user_phone,
                              [
                                `Hello ${repair.user_name || 'there'}!`,
                                `We've diagnosed your *${repair.device_type || 'device'}*:`,
                                repair.diagnosis || 'Diagnosis complete.',
                                repair.repair_cost != null ? `Estimated repair cost: *${formatCurrency(repair.repair_cost)}*` : '',
                                repair.estimated_completion ? `Expected completion: *${new Date(repair.estimated_completion).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}*` : '',
                                'Reply to this message to approve the repair. Thank you!',
                              ].filter(Boolean)
                            )}
                            className="mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                            title="Send WhatsApp quote"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> Quote
                          </button>
                        )}
                        {(repair.status === 'ready_for_pickup' || repair.status === 'repaired') && (
                          <button
                            onClick={() => openWhatsApp(
                              repair.user_phone,
                              [
                                `Hello ${repair.user_name || 'there'}!`,
                                `Good news — your ${repair.device_type || 'device'} has been *repaired* and is ready for pickup at John20 Deals!`,
                                repair.repair_cost != null ? `Total cost: *${formatCurrency(repair.repair_cost)}*` : '',
                                'Reply to this message or visit our shop to collect it. Thank you!',
                              ].filter(Boolean)
                            )}
                            className="mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
                            title="Send WhatsApp notification"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                          </button>
                        )}
                        {repair.status === 'declined' && (
                          <button
                            onClick={() => openWhatsApp(
                              repair.user_phone,
                              [
                                `Hello ${repair.user_name || 'there'}!`,
                                `We're sorry — we couldn't repair your *${repair.device_type || 'device'}* this time.`,
                                repair.decline_reason ? `Reason: ${repair.decline_reason}` : '',
                                'You are welcome to contact us anytime. Thank you!',
                              ].filter(Boolean)
                            )}
                            className="mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                            title="Send WhatsApp notification"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (confirm('Delete this repair request?')) {
                              const { error } = await supabase.from('repair_requests').delete().eq('id', repair.id);
                              if (error) toast.error('Failed to delete request');
                              else {
                                toast.success('Request deleted');
                                fetchData();
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 transition-colors p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>

            <form id="product-form" onSubmit={handleSaveProduct} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Product Name</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    name="name" 
                    defaultValue={currentProduct?.name} 
                    required 
                    placeholder="e.g. MacBook Pro M3"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      defaultValue={currentProduct?.price} 
                      required 
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Stock</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      name="stock" 
                      type="number" 
                      defaultValue={currentProduct?.stock || 10} 
                      required 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select 
                      name="category" 
                      defaultValue={currentProduct?.category || 'Laptops'} 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="Laptops">Laptops</option>
                      <option value="Phones">Phones</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Gadgets">Gadgets</option>
                      <option value="Deals">Deals</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Condition</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select 
                      name="condition" 
                      defaultValue={currentProduct?.condition || 'New'} 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="New">New</option>
                      <option value="Open Box">Open Box</option>
                      <option value="Refurbished">Refurbished</option>
                      <option value="Used - (UK USED)">Used - (UK USED)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  name="swap_allowed"
                  id="swap_allowed"
                  defaultChecked={currentProduct ? currentProduct.swap_allowed !== false : true}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
                <div>
                  <label htmlFor="swap_allowed" className="text-sm font-bold text-slate-900 dark:text-white block">
                    Allow Swaps
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">If checked, customers can propose to trade in items for this product.</p>
                </div>
              </div>
              
              {/* Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Image (Required)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      {imageUrl && (
                        <div className="relative group">
                          <img src={imageUrl} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100 shadow-sm" />
                          <button 
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="h-3 w-3 rotate-45" />
                          </button>
                        </div>
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="flex flex-col items-center justify-center w-full h-24 px-4 transition bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-400 hover:bg-blue-50/30 group">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                          <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 text-center">
                            {uploading ? 'Uploading...' : 'Upload Primary'}
                          </span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 1)}
                            className="hidden"
                            disabled={uploading}
                          />
                        </div>
                      </label>
                    </div>
                    <div className="relative">
                      <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        name="image_url" 
                        defaultValue={currentProduct?.image_url} 
                        placeholder="Or paste image URL here..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" 
                        disabled={!!imageUrl}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secondary Image (Optional)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      {imageUrl2 && (
                        <div className="relative group">
                          <img src={imageUrl2} alt="Preview 2" className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100 shadow-sm" />
                          <button 
                            type="button"
                            onClick={() => setImageUrl2('')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="h-3 w-3 rotate-45" />
                          </button>
                        </div>
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="flex flex-col items-center justify-center w-full h-24 px-4 transition bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-400 hover:bg-blue-50/30 group">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                          <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 text-center">
                            {uploading ? 'Uploading...' : 'Upload Secondary'}
                          </span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 2)}
                            className="hidden"
                            disabled={uploading}
                          />
                        </div>
                      </label>
                    </div>
                    <div className="relative">
                      <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        name="image_url_2" 
                        defaultValue={currentProduct?.image_url_2} 
                        placeholder="Or paste image URL here..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" 
                        disabled={!!imageUrl2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  name="description" 
                  defaultValue={currentProduct?.description} 
                  rows={4} 
                  placeholder="Tell customers about this product..."
                  className="w-full p-4 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                />
              </div>
            </form>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                onClick={() => {
                  const form = document.getElementById('product-form') as HTMLFormElement | null;
                  if (form) form.requestSubmit();
                }}
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70"
              >
                {isEditing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Swap Modal */}
      {acceptingSwap && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Accept Swap</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{acceptingSwap.product_name}</p>
                </div>
              </div>
              <button
                onClick={() => setAcceptingSwap(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAcceptSwap} className="p-6 space-y-5">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                <p className="font-bold text-slate-900 dark:text-white">{acceptingSwap.user_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{acceptingSwap.user_phone}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trade-in Value (GH₵)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={acceptTradeIn}
                      onChange={(e) => setAcceptTradeIn(e.target.value)}
                      placeholder="e.g. 800"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cash Difference (GH₵)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={acceptCashDiff}
                      onChange={(e) => setAcceptCashDiff(e.target.value)}
                      placeholder="e.g. 400"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Terms & Conditions</label>
                <textarea
                  value={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.value)}
                  placeholder="e.g. Delivery within 48 hours. Device must be in good working condition."
                  rows={3}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingSwap}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                {savingSwap ? 'Accepting...' : 'Accept & Notify via WhatsApp'}
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                Accepting opens WhatsApp with a pre-filled message to the customer containing the swap conditions.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Diagnose Repair Modal */}
      {diagnosingRepair && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 dark:bg-blue-500/10 p-2.5 rounded-xl">
                  <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Diagnose Repair</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{diagnosingRepair.device_type || 'Device'}</p>
                </div>
              </div>
              <button
                onClick={() => setDiagnosingRepair(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveDiagnosis} className="p-6 space-y-5">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                <p className="font-bold text-slate-900 dark:text-white">{diagnosingRepair.user_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{diagnosingRepair.user_phone}</p>
                {diagnosingRepair.issue_description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported: </span>
                    {diagnosingRepair.issue_description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Diagnosis</label>
                <textarea
                  value={diagDiagnosis}
                  onChange={(e) => setDiagDiagnosis(e.target.value)}
                  placeholder="e.g. Cracked screen, battery health at 62% — replacing screen and battery."
                  rows={3}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Repair Cost (GH₵)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={diagCost}
                      onChange={(e) => setDiagCost(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expected Completion</label>
                  <input
                    type="date"
                    value={diagEta}
                    onChange={(e) => setDiagEta(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingDiagnosis}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <Wrench className="h-5 w-5" />
                {savingDiagnosis ? 'Saving...' : 'Save Diagnosis & Notify via WhatsApp'}
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                Saving opens WhatsApp with a pre-filled quote to the customer containing the diagnosis, cost, and ETA.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 dark:bg-blue-500/10 p-2.5 rounded-xl">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Details</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-8">
              {/* Customer & Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" /> Customer Info
                  </h3>
                  <p className="font-bold text-slate-900 dark:text-white mb-1">User ID: <span className="font-normal text-slate-600 dark:text-slate-300 text-sm">{selectedOrder.user_id}</span></p>
                  <p className="font-bold text-slate-900 dark:text-white mb-1">Date: <span className="font-normal text-slate-600 dark:text-slate-300 text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</span></p>
                  <p className="font-bold text-slate-900 dark:text-white">Status: <span className={`inline-flex items-center ml-2 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${getStatusStyles(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Delivery Info
                  </h3>
                  <p className="font-bold text-slate-900 dark:text-white mb-1">Method: <span className="font-normal text-slate-600 dark:text-slate-300 text-sm capitalize">{selectedOrder.delivery_method || 'N/A'}</span></p>
                  <div className="font-bold text-slate-900 dark:text-white flex items-start gap-1 mt-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span className="font-normal text-slate-600 dark:text-slate-300 text-sm">{selectedOrder.shipping_address || 'No address provided'}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.products?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-700 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100 dark:border-slate-600">
                        <img src={item.image_url || 'https://placehold.co/600x600/f8fafc/94a3b8?text=Image'} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <div className="font-black text-slate-900 dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-500 dark:text-slate-400">Total Amount</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(selectedOrder.total_price)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
