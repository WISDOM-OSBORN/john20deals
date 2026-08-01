import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Mail, Shield, Phone, MapPin, Edit2, Package, Clock, CheckCircle, Tag, Wrench, RefreshCw, Bell, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Helmet } from 'react-helmet-async';
import { fetchNotifications, markNotificationsRead, NotificationRow } from '../lib/notifications';

interface Order {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  delivery_method?: string;
  products: any[];
}

interface SellRequest {
  id: string;
  created_at: string;
  status: string;
  device_type: string | null;
  brand: string | null;
  model: string | null;
}

interface RepairRequest {
  id: string;
  created_at: string;
  status: string;
  device_type: string | null;
  issue_description: string | null;
}

interface SwapRequest {
  id: string;
  created_at: string;
  status: string;
  product_name: string | null;
  offer_description: string | null;
  trade_in_value?: number | null;
  cash_difference?: number | null;
  terms?: string | null;
}

export default function Profile() {
  const { user, loading, isAdmin, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone_number: user?.user_metadata?.phone_number || '',
    location: user?.user_metadata?.location || '',
    avatar_url: user?.user_metadata?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchRequests();
      fetchNotificationsList();
    }
  }, [user]);

  const fetchNotificationsList = async () => {
    if (!user) return;
    setLoadingNotifications(true);
    const items = await fetchNotifications(user.id);
    setNotifications(items);
    setLoadingNotifications(false);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setOrders(data);
    }
    setLoadingOrders(false);
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    const [sellRes, repairRes, swapRes] = await Promise.all([
      supabase.from('sell_requests').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('repair_requests').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('swap_requests').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
    ]);
    if (!sellRes.error && sellRes.data) setSellRequests(sellRes.data);
    if (!repairRes.error && repairRes.data) setRepairRequests(repairRes.data);
    if (!swapRes.error && swapRes.data) setSwapRequests(swapRes.data);
    setLoadingRequests(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>My Dashboard | John20 Deals</title>
      </Helmet>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Dashboard</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Edit2 className="h-4 w-4" /> Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md sticky top-24">
            <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 flex flex-col items-center gap-4 border-b border-slate-100 dark:border-slate-800 text-center">
              <div className="relative group">
                <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-900 shadow-md">
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt={formData.full_name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-blue-600" />
                  )}
                </div>

              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user.user_metadata.full_name}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Member since {new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full p-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full p-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full p-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="e.g. Accra, Ghana"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Avatar URL</label>
                      <input
                        type="url"
                        value={formData.avatar_url}
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                        className="w-full p-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 text-sm"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email Address</p>
                      <p className="text-slate-900 dark:text-white font-bold text-sm">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm">
                      <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phone Number</p>
                      <p className="text-slate-900 dark:text-white font-bold text-sm">{user.user_metadata.phone_number || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Location</p>
                      <p className="text-slate-900 dark:text-white font-bold text-sm">{user.user_metadata.location || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Account Role</p>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-900 dark:text-white font-bold capitalize text-sm">{isAdmin ? 'Administrator' : 'Customer'}</p>
                        {isAdmin && (
                          <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                            ADMIN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h3>
              </div>
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={async () => {
                    if (!user) return;
                    await markNotificationsRead(user.id);
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="p-6">
              {loadingNotifications ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-10 w-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No notifications yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Updates on your orders, swaps, and requests will show here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl border ${
                        n.read
                          ? 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                          : 'border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10'
                      }`}
                    >
                      <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl flex-shrink-0">
                        {n.type === 'swap' ? (
                          <RefreshCw className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        ) : n.type === 'sell' ? (
                          <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : n.type === 'repair' ? (
                          <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        ) : (
                          <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</p>
                        {n.message && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>}
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                          {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md mt-6">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <Package className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order History</h3>
            </div>
            
            <div className="p-6">
              {loadingOrders ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No orders yet</h4>
                  <p className="text-slate-500 dark:text-slate-400">When you place an order, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Order ID</p>
                          <p className="font-bold text-slate-900 dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Date Placed</p>
                          <p className="font-bold text-slate-900 dark:text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                          <p className="font-black text-blue-600 dark:text-blue-400">{formatCurrency(order.total_price)}</p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                            order.status === 'paid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {order.status === 'delivered' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Items in this order</h5>
                        <div className="space-y-4">
                          {order.products?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100 dark:border-slate-800">
                                <img src={item.image_url || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-grow">
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Qty: {item.quantity}</p>
                              </div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {order.delivery_method && (
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Delivery Method</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{order.delivery_method}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md mt-6">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sell, Repair & Swap Requests</h3>
            </div>
            
            <div className="p-6">
              {loadingRequests ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                </div>
              ) : sellRequests.length === 0 && repairRequests.length === 0 && swapRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No requests yet</h4>
                  <p className="text-slate-500 dark:text-slate-400">Sell, repair, or swap requests you submit will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sellRequests.map((req) => (
                    <div key={req.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl">
                          <Tag className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {[req.brand, req.model].filter(Boolean).join(' ') || req.device_type || 'Sell request'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(req.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        req.status === 'purchased' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        req.status === 'declined' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        req.status === 'contacted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {req.status === 'purchased' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {req.status}
                      </span>
                    </div>
                  ))}
                  {swapRequests.map((req) => (
                    <div key={req.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl">
                          <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {req.product_name || 'Swap request'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(req.created_at).toLocaleDateString()}
                          </p>
                          {req.status === 'accepted' && (
                            <div className="mt-2 space-y-1 text-xs">
                              {req.trade_in_value != null && (
                                <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  Trade-in value: {formatCurrency(req.trade_in_value)}
                                </p>
                              )}
                              {req.cash_difference != null && (
                                <p className="text-slate-600 dark:text-slate-300 font-semibold">
                                  Cash difference: {formatCurrency(req.cash_difference)}
                                </p>
                              )}
                              {req.terms && (
                                <p className="text-slate-500 dark:text-slate-400">Terms: {req.terms}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        req.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        req.status === 'declined' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {req.status === 'accepted' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {req.status}
                      </span>
                    </div>
                  ))}
                  {repairRequests.map((req) => (
                    <div key={req.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-xl">
                          <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {req.device_type || 'Repair request'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {req.issue_description || new Date(req.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        req.status === 'repaired' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        req.status === 'declined' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {req.status === 'repaired' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
