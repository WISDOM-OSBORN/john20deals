const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. imports
content = content.replace(
  "import { Plus, Trash2, Edit, Package, ShoppingBag, DollarSign, Users, Upload, Send, Mail, Tag, Info, Layers, X, CreditCard, CheckCircle, Clock, BarChart3, User, MapPin, Truck } from 'lucide-react';",
  "import { Plus, Trash2, Edit, Package, ShoppingBag, DollarSign, Users, Upload, Send, Mail, Tag, Info, Layers, X, CreditCard, CheckCircle, Clock, BarChart3, User, MapPin, Truck, RefreshCw } from 'lucide-react';"
);

// 2. Types
if (!content.includes('interface SwapRequest')) {
  content = content.replace(
    "interface Subscriber {",
    `interface SwapRequest {
  id: string;
  created_at: string;
  status: string;
  user_name: string;
  user_phone: string;
  product_name: string;
  offer_description: string;
  image_url_1: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
}

interface Subscriber {`
  );
}

// 3. States
if (!content.includes('const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);')) {
  content = content.replace(
    "const [subscribers, setSubscribers] = useState<Subscriber[]>([]);",
    `const [subscribers, setSubscribers] = useState<Subscriber[]>([]);\n  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);`
  );
}
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'newsletter' | 'customers' | 'analytics'>('products');",
  "const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'newsletter' | 'customers' | 'analytics' | 'swaps'>('products');"
);

// 4. fetchData
if(!content.includes("const { data: swapData } = await supabase.from('swap_requests').select('*').order('created_at', { ascending: false });")) {
  content = content.replace(
    "const { data: subscribersData } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });",
    `const { data: subscribersData } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });\n    const { data: swapData } = await supabase.from('swap_requests').select('*').order('created_at', { ascending: false });`
  );
  content = content.replace(
    "if (subscribersData) setSubscribers(subscribersData);",
    "if (subscribersData) setSubscribers(subscribersData);\n      if (swapData) setSwapRequests(swapData as SwapRequest[]);"
  );
}

// 5. handleSwapStatus update function
const handleSwapStatusCode = `
  const handleSwapStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('swap_requests').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success('Swap request updated');
      setSwapRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };
`;

if (!content.includes('handleSwapStatus')) {
  content = content.replace(
    "const handleOrderUpdate = async",
    handleSwapStatusCode + "\n\n  const handleOrderUpdate = async"
  );
}

// 6. Tabs UI
if(!content.includes("setActiveTab('swaps')")) {
  content = content.replace(
    `<button
          onClick={() => setActiveTab('customers')}`,
    `<button
          onClick={() => setActiveTab('swaps')}
          className={\`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap \${
            activeTab === 'swaps' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }\`}
        >
          Swaps
          {swapRequests.filter(s => s.status === 'pending').length > 0 && (
            <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 py-0.5 px-2 rounded-full text-xs font-bold">
              {swapRequests.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('customers')}`
  );
}

// 7. Swaps Tab Content
const swapsTabContent = `
        {activeTab === 'swaps' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Swap Requests</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage user trade-in offers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {swapRequests.map((request) => (
                <div key={request.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">{request.user_name || 'Anonymous User'}</h4>
                      <a href={\`https://wa.me/\${request.user_phone}\`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                        {request.user_phone}
                      </a>
                    </div>
                    <span className={\`px-3 py-1 rounded-full text-xs font-bold \${
                      request.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      request.status === 'reviewed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      request.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }\`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Wants to swap for:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{request.product_name || 'Unknown Product'}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Offer Description:</p>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">{request.offer_description}</p>
                  </div>

                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[request.image_url_1, request.image_url_2, request.image_url_3].filter(Boolean).map((img, idx) => (
                      <a key={idx} href={img!} target="_blank" rel="noopener noreferrer" className="block flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity">
                        <img src={img!} alt="Swap offer" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                      <button onClick={() => handleSwapStatus(request.id, 'reviewed')} className="flex-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                        Mark Reviewed
                      </button>
                      <button onClick={() => handleSwapStatus(request.id, 'accepted')} className="flex-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                        Accept
                      </button>
                      <button onClick={() => handleSwapStatus(request.id, 'declined')} className="flex-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 py-2 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {swapRequests.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <RefreshCw className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Swap Requests</h3>
                  <p className="text-slate-500 dark:text-slate-400">You don't have any pending swap offers yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
`;

if(!content.includes("activeTab === 'swaps'")) {
  content = content.replace(
    "{activeTab === 'customers' && (",
    swapsTabContent + "\n\n        {activeTab === 'customers' && ("
  );
}

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
console.log('patched AdminDashboard.tsx successfully');
