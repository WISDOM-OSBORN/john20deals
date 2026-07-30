import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Package, ShoppingBag, DollarSign, Users, Upload, Send, Mail, Tag, Info, Layers, X, CreditCard, CheckCircle, Clock, BarChart3, User, MapPin, Truck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  condition?: string;
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

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'newsletter' | 'customers' | 'analytics'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Newsletter State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

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
    
    if (productsData) setProducts(productsData);
    if (subscribersData) setSubscribers(subscribersData);
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
      
      // 1. Get presigned URL from our backend
      const urlResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type
        }),
      });

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await urlResponse.json();

      // 2. Upload directly to Cloudflare R2 using the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to storage');
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

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast.error('Please enter a message to broadcast');
      return;
    }

    setSendingBroadcast(true);
    try {
      // In a real app, this would call a server function to send emails/messages
      // For now, we'll simulate it by fetching all users and logging
      const { data: profiles } = await supabase.from('profiles').select('email, phone_number');
      const { data: subs } = await supabase.from('newsletter_subscribers').select('email');
      
      const allEmails = new Set([
        ...(profiles?.map(p => p.email) || []),
        ...(subs?.map(s => s.email) || [])
      ]);
      
      console.log('Broadcasting to:', Array.from(allEmails));
      console.log('Message:', broadcastMessage);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Broadcast sent to ${allEmails.size} unique recipients!`);
      setBroadcastMessage('');
    } catch (error: any) {
      toast.error('Failed to send broadcast: ' + error.message);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const generateProductBroadcast = (product: Product) => {
    const msg = `🔥 NEW ARRIVAL: ${product.name}\n💰 Price: ${formatCurrency(product.price)}\n\nCheck it out at John20 Deals!`;
    setBroadcastMessage(msg);
    setActiveTab('newsletter');
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
      fetchData();
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'paid':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (authLoading) return <div className="p-8">Loading...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Admin Dashboard | John20 Deals</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="flex items-center justify-between mb-8">
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Total Products</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{products.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-2xl">
              <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{orders.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-2xl">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Revenue (Est)</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {formatCurrency(orders.filter(o => o.status !== 'cancelled').reduce((acc, order) => acc + order.total_price, 0))}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-2xl">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Pending</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {orders.filter(o => o.status === 'pending').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Delivered</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {orders.filter(o => o.status === 'delivered').length}
              </h3>
            </div>
          </div>
        </div>
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
          Broadcast
        </button>
      </div>

      {/* Content */}
      {activeTab === 'products' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Product Name</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Category</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Condition</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Price</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Stock</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    {product.image_url && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{product.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                      {product.condition || 'New'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-black">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 5 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <button 
                      onClick={() => generateProductBroadcast(product)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl transition-all"
                      title="Broadcast this product"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentProduct(product);
                        setImageUrl(product.image_url || '');
                        setImageUrl2(product.image_url_2 || '');
                        setIsEditing(true);
                        setShowForm(true);
                      }}
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
      ) : activeTab === 'orders' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Order ID</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Date</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Total</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    <span className="text-blue-600 dark:text-blue-400">#</span>{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                    {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-black">{formatCurrency(order.total_price)}</td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
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
      ) : activeTab === 'analytics' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white">Revenue Trend (Last 30 Days)</h3>
                <DollarSign className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="h-80 w-full">
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
              <div className="h-80 w-full">
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
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Orders</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Total Spend</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Last Order</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{customer.order_count} orders</span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-black">{formatCurrency(customer.total_spend)}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                    {customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
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
      ) : activeTab === 'newsletter' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Email Address</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Joined Date</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
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
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{sub.email}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
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

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-md sticky top-24">
              <div className="text-center mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Broadcast</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Send to all users & subscribers</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Message Content</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all p-4 text-sm text-slate-700 dark:text-slate-300"
                    placeholder="Type your announcement..."
                  />
                </div>
                <button
                  onClick={handleBroadcast}
                  disabled={sendingBroadcast}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {sendingBroadcast ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Now
                    </>
                  )}
                </button>
              </div>
            </div>
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

            <form onSubmit={handleSaveProduct} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Product Name</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    name="name" 
                    defaultValue={currentProduct?.name} 
                    required 
                    placeholder="e.g. MacBook Pro M3"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select 
                      name="category" 
                      defaultValue={currentProduct?.category || 'Laptops'} 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="New">New</option>
                      <option value="Open Box">Open Box</option>
                      <option value="Refurbished">Refurbished</option>
                      <option value="Used - (UK USED)">Used - (UK USED)</option>
                    </select>
                  </div>
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" 
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" 
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
                  className="w-full p-4 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
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
                  const form = document.querySelector('form');
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
                        <img src={item.image_url || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-contain" />
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
