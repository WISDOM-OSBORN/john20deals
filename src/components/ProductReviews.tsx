import React, { useState, useEffect } from 'react';
import { Star, User, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as any || []);
    } catch (error) {
      console.warn('Reviews table not found or error fetching:', error);
      setReviews([]); // Fallback to empty
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
      });

      if (error) throw error;
      
      toast.success('Review submitted!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (error: any) {
      toast.error('Could not post review. The reviews table might not be set up yet.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="mt-16 border-t border-slate-100 dark:border-slate-800 pt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(averageRating) ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
              ))}
            </div>
            <span className="text-slate-500 dark:text-slate-400 font-bold">{averageRating.toFixed(1)} out of 5</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{reviews.length} reviews</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Review Form */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`h-8 w-8 ${star <= rating ? 'text-amber-400 fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full p-4 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="What did you think about this gadget?"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-900/10 dark:shadow-blue-900/20 disabled:opacity-70"
              >
                {submitting ? 'Posting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>

        {/* Review List */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="animate-pulse space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-50 dark:bg-slate-900 rounded-3xl"></div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      {review.profiles?.avatar_url ? (
                        <img src={review.profiles.avatar_url} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{review.profiles?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
