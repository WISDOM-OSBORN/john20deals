const fs = require('fs');
let content = fs.readFileSync('src/pages/ProductDetails.tsx', 'utf8');

// 1. imports
content = content.replace(
  "import { ShoppingCart, ArrowLeft, Check, ShieldCheck, Truck } from 'lucide-react';",
  "import { ShoppingCart, ArrowLeft, Check, ShieldCheck, Truck, RefreshCw, X, Upload } from 'lucide-react';"
);

// 2. state vars
content = content.replace(
  "const navigate = useNavigate();",
  `const navigate = useNavigate();
  
  // Swap Modal State
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapUploading, setSwapUploading] = useState(false);
  const [swapImages, setSwapImages] = useState<string[]>([]);
  
  const handleSwapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSwapUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      const apiEndpoint = import.meta.env.PROD ? '/.netlify/functions/upload-url' : '/api/upload';
      const urlResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!urlResponse.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, publicUrl } = await urlResponse.json();
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });
      if (!uploadResponse.ok) throw new Error('Failed to upload file');
      
      setSwapImages(prev => [...prev, publicUrl].slice(0, 3));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setSwapUploading(false);
    }
  };
  
  const submitSwapRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to propose a swap');
      navigate('/auth');
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const apiEndpoint = import.meta.env.PROD ? '/.netlify/functions/submit-swap' : '/api/submit-swap';
    
    try {
      setSwapUploading(true);
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id,
          productName: product?.name,
          userId: user.id,
          userName: formData.get('userName'),
          userPhone: formData.get('userPhone'),
          description: formData.get('description'),
          imageUrls: swapImages
        })
      });
      if (!res.ok) throw new Error('Failed to submit swap');
      toast.success('Swap request sent! The shop will contact you.');
      setShowSwapModal(false);
      setSwapImages([]);
    } catch (error) {
      toast.error('Failed to submit swap request');
    } finally {
      setSwapUploading(false);
    }
  };
`
);

// 3. buttons
content = content.replace(
  /<button\n\s*onClick={handleAddToCart}\n\s*className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600\/20 flex items-center justify-center gap-2"\n\s*>\n\s*<ShoppingCart className="h-5 w-5" \/>\n\s*Add to Cart\n\s*<\/button>/g,
  `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
              <button
                onClick={() => setShowSwapModal(true)}
                className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Propose Swap
              </button>
            </div>`
);

// 4. render modal at end of return block
// ProductDetails returns `<div className="...">...</div>`, so let's put it before the last `</div>` or just append it.
// Actually, it's easier to find `export default function ProductDetails()` and see the return block.
const modalCode = `
      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                Propose a Swap
              </h3>
              <button 
                onClick={() => setShowSwapModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-700/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitSwapRequest} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
                  <input required name="userName" defaultValue={user?.user_metadata?.full_name || ''} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone / WhatsApp</label>
                  <input required name="userPhone" defaultValue={user?.user_metadata?.phone_number || ''} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Describe Your Item</label>
                <textarea required name="description" rows={3} placeholder="Condition, specs, flaws..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white resize-none"></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Upload Images (Max 3)</label>
                <div className="flex gap-3">
                  {swapImages.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setSwapImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {swapImages.length < 3 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-500">Add Photo</span>
                      <input type="file" accept="image/*" onChange={handleSwapUpload} className="hidden" disabled={swapUploading} />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="submit" disabled={swapUploading} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {swapUploading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace(
  "export default function ProductDetails() {",
  "export default function ProductDetails() {"
);

// We need to inject the modal into the return statement.
// Look for the last `    </div>\n  );`
const lastDivIndex = content.lastIndexOf('    </div>\n  );');
if (lastDivIndex !== -1) {
  content = content.slice(0, lastDivIndex) + modalCode + content.slice(lastDivIndex);
}

fs.writeFileSync('src/pages/ProductDetails.tsx', content);
console.log('patched ProductDetails.tsx');
