import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClerk } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { useTheme } from '../context/ThemeContext';
import { Navigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Tag, Wrench, RefreshCw, Bell, CheckCheck, Settings, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';
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
  diagnosis: string | null;
  repair_cost: number | null;
  estimated_completion: string | null;
  decline_reason: string | null;
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
  const { user, loading, isAdmin } = useAuth();
  const { openUserProfile } = useClerk();
  const { isDark } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

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

  const handleCancelRepair = async (req: RepairRequest) => {
    if (!confirm('Cancel this repair request?')) return;
    const { error } = await supabase
      .from('repair_requests')
      .update({ status: 'cancelled_by_user', cancelled_at: new Date().toISOString() })
      .eq('id', req.id);
    if (error) {
      toast.error('Failed to cancel request');
      return;
    }
    toast.success('Repair request cancelled');
    fetchRequests();
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleManageAccount = () => {
    openUserProfile({ appearance: { baseTheme: isDark ? dark : undefined } });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>My Dashboard | John20 Deals</title>
      </Helmet>
      <Breadcrumbs items={[{ name: 'My Dashboard' }]} />
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Dashboard</h1>
          {isAdmin && (
            <span className="bg-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wide">
              Administrator
            </span>
          )}
        </div>
        <button
          onClick={handleManageAccount}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
        >
          <Settings className="h-4 w-4" /> Manage Account
        </button>
      </div>

      <div className="space-y-6">
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

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
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

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
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
                  <div key={req.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
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
                      <div className="flex items-center gap-2">
                        {(req.status === 'received' || req.status === 'diagnosed') && (
                          <button
                            onClick={() => handleCancelRepair(req)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                          >
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          req.status === 'picked_up' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          req.status === 'declined' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          req.status === 'cancelled_by_user' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
                          req.status === 'ready_for_pickup' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {req.status === 'picked_up' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {req.status.replaceAll('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {req.status !== 'declined' && req.status !== 'cancelled_by_user' && (
                      <div className="mt-5">
                        {(() => {
                          const steps = ['received', 'diagnosed', 'in_progress', 'ready_for_pickup', 'picked_up'];
                          const current = steps.indexOf(req.status);
                          const active = current === -1 ? 0 : current;
                          const labels = ['Received', 'Diagnosed', 'In Progress', 'Ready', 'Picked Up'];
                          return (
                            <div className="flex items-center">
                              {steps.map((step, idx) => {
                                const done = idx < active;
                                const isCurrent = idx === active;
                                return (
                                  <div key={step} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center">
                                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                                        done ? 'bg-orange-500 border-orange-500 text-white' :
                                        isCurrent ? 'bg-white dark:bg-slate-800 border-orange-500 text-orange-500 dark:text-orange-400' :
                                        'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                                      }`}>
                                        {done ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                                      </div>
                                      <span className={`text-[10px] font-bold mt-1 whitespace-nowrap ${
                                        done || isCurrent ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'
                                      }`}>
                                        {labels[idx]}
                                      </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                      <div className={`flex-1 h-0.5 mx-2 mt-0 -mb-4 ${idx < active ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}

                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {req.diagnosis && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Diagnosis</p>
                              <p className="text-xs text-slate-700 dark:text-slate-300">{req.diagnosis}</p>
                            </div>
                          )}
                          {req.repair_cost != null && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Estimated Cost</p>
                              <p className="text-sm font-black text-orange-600 dark:text-orange-400">{formatCurrency(req.repair_cost)}</p>
                            </div>
                          )}
                          {req.estimated_completion && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Expected Completion</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {new Date(req.estimated_completion).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {req.status === 'declined' && req.decline_reason && (
                      <p className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium">
                        Reason: {req.decline_reason}
                      </p>
                    )}
                    {req.status === 'cancelled_by_user' && (
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        This repair request was cancelled.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
