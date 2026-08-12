import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../lib/upload';
import ImageUploadButtons from '../components/ImageUploadButtons';
import Breadcrumbs from '../components/Breadcrumbs';
import { ArrowLeft, X, Wrench, Smartphone, Laptop, Tablet, Monitor, AudioLines, Watch } from 'lucide-react';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const DEVICE_TYPES = [
  { value: 'phone', label: 'Phone', icon: Smartphone },
  { value: 'laptop', label: 'Laptop', icon: Laptop },
  { value: 'tablet', label: 'Tablet', icon: Tablet },
  { value: 'monitor', label: 'Monitor / TV', icon: Monitor },
  { value: 'audio', label: 'Audio', icon: AudioLines },
  { value: 'wearable', label: 'Wearable', icon: Watch },
];

export default function Repair() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImages(prev => [...prev, url].slice(0, 3));
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to book a repair');
      navigate('/login');
      return;
    }

    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const apiEndpoint = import.meta.env.PROD ? '/.netlify/functions/submit-repair' : '/api/submit-repair';
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: form.get('userName'),
          userPhone: form.get('userPhone'),
          deviceType: form.get('deviceType'),
          issueDescription: form.get('description'),
          imageUrls: images,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      toast.success('Repair request submitted! We will contact you.');
      navigate('/order-success?type=repair');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Book a Repair | John20 Deals</title>
        <meta name="description" content="Book expert phone and laptop repair in Accra and Tema, Ghana. Screen replacements, battery fixes and more with honest upfront quotes." />
        <link rel="canonical" href="https://john20deals.com/repair" />
      </Helmet>

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <Breadcrumbs items={[{ name: 'Book a Repair' }]} />

      <div className="text-center mb-8">
        <div className="bg-orange-50 dark:bg-orange-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wrench className="h-8 w-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Book a Repair</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Phone and laptop repair in Accra & Tema, Ghana. Describe the problem and our expert technicians will diagnose and fix your device with an honest, upfront quote.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
              <input required name="userName" defaultValue={user?.user_metadata?.full_name || ''} placeholder="Your full name" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Phone / WhatsApp</label>
              <input required name="userPhone" defaultValue={user?.user_metadata?.phone_number || ''} placeholder="e.g. 0551234567" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Device Type</label>
            <select name="deviceType" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" defaultValue="phone">
              {DEVICE_TYPES.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Describe the Problem</label>
            <textarea required name="description" rows={4} placeholder="e.g. Screen cracked, battery drains fast, won't charge..." className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Upload Photos of the Issue (Max 3)</label>
            <div className="flex gap-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                  <img src={img} alt="Device issue" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {images.length < 3 && (
              <div className="mt-3 max-w-xs">
                <ImageUploadButtons onFile={handleUpload} disabled={uploading} compact />
              </div>
            )}
            {uploading && <p className="text-xs text-slate-400 mt-2">Uploading...</p>}
          </div>

          <button type="submit" disabled={submitting} className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            <Wrench className="h-5 w-5" />
            {submitting ? 'Submitting...' : 'Book Repair'}
          </button>

          <p className="text-xs text-center text-slate-400">
            We'll diagnose your device and contact you on WhatsApp with a repair quote.
          </p>
        </form>
      </div>
    </div>
  );
}
