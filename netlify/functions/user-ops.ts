import type { Handler } from '@netlify/functions';
import {
  isAllowedOrigin,
  corsHeaders,
  corsPreflight,
  corsError,
  getRequestOrigin,
} from './shared/cors';
import { getClientIp, isRateLimited } from './shared/rate-limit';
import { getSupabaseConfig } from './shared/notify-admin';

export const handler: Handler = async (event) => {
  const requestOrigin = getRequestOrigin(event);

  if (event.httpMethod === 'OPTIONS') {
    if (!isAllowedOrigin(requestOrigin, event)) return { statusCode: 403, body: 'Forbidden' };
    return corsPreflight(requestOrigin);
  }
  if (event.httpMethod !== 'POST') {
    return corsError(405, 'Method Not Allowed', requestOrigin);
  }
  if (!isAllowedOrigin(requestOrigin, event)) {
    return corsError(403, 'Origin not allowed', requestOrigin);
  }

  const ip = getClientIp(event);
  if (isRateLimited(ip)) {
    return corsError(429, 'Too many requests, please try again later', requestOrigin);
  }

  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return corsError(500, 'Server configuration error', requestOrigin);
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  };

  const ok = (payload: any) => ({
    statusCode: 200,
    headers: corsHeaders(requestOrigin),
    body: JSON.stringify(payload),
  });

  const fail = (message: string) => corsError(500, message, requestOrigin);

  try {
    const body = JSON.parse(event.body || '{}');
    const { action } = body;

    switch (action) {
      // -------------------------------------------------------------
      case 'fetchUserData': {
        const { userId } = body;
        if (!userId) return corsError(400, 'userId is required', requestOrigin);
        const filter = `user_id=eq.${encodeURIComponent(userId)}`;
        const [ordersRes, sellRes, repairRes, swapRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/orders?${filter}&order=created_at.desc&select=*`, { headers }),
          fetch(`${supabaseUrl}/rest/v1/sell_requests?${filter}&order=created_at.desc&select=*`, { headers }),
          fetch(`${supabaseUrl}/rest/v1/repair_requests?${filter}&order=created_at.desc&select=*`, { headers }),
          fetch(`${supabaseUrl}/rest/v1/swap_requests?${filter}&order=created_at.desc&select=*`, { headers }),
        ]);
        const json = async (r: Response) => (r.ok ? r.json() : []);
        return ok({
          orders: await json(ordersRes),
          sell: await json(sellRes),
          repair: await json(repairRes),
          swaps: await json(swapRes),
        });
      }

      // -------------------------------------------------------------
      case 'fetchNotifications': {
        const { userId } = body;
        if (!userId) return corsError(400, 'userId is required', requestOrigin);
        const filter = `user_id=eq.${encodeURIComponent(userId)}`;
        const [notifRes, profileRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/notifications?${filter}&order=created_at.desc&select=*`, { headers }),
          fetch(`${supabaseUrl}/rest/v1/profiles?${filter}&select=*`, { headers }),
        ]);
        const json = async (r: Response) => (r.ok ? r.json() : []);
        const notifications = await json(notifRes);
        const profiles = await json(profileRes);
        return ok({ notifications, unread: notifications.filter((n: any) => !n.read).length, profiles });
      }

      // -------------------------------------------------------------
      case 'markNotificationsRead': {
        const { ids } = body as { ids: string[] };
        if (!Array.isArray(ids) || ids.length === 0) {
          return corsError(400, 'ids required', requestOrigin);
        }
        const inFilter = ids.map((id) => `"${id}"`).join(',');
        const res = await fetch(`${supabaseUrl}/rest/v1/notifications?id=in.(${inFilter})`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ read: true }),
        });
        if (!res.ok) return fail('Failed to update notifications');
        return ok({ success: true });
      }

      // -------------------------------------------------------------
      case 'cancelRepair': {
        const { id } = body;
        const res = await fetch(`${supabaseUrl}/rest/v1/repair_requests?id=eq.${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: 'cancelled' }),
        });
        if (!res.ok) return fail('Failed to cancel repair');
        return ok({ success: true });
      }

      // -------------------------------------------------------------
      case 'syncProfile': {
        const { profile } = body as { profile: Record<string, any> };
        if (!profile?.id) return corsError(400, 'Profile id required', requestOrigin);
        const payload = {
          id: profile.id,
          email: profile.email ?? null,
          full_name: profile.full_name ?? null,
          phone: profile.phone ?? null,
          location: profile.location ?? null,
          created_at: profile.created_at ?? new Date().toISOString(),
        };
        // upsert on id
        const res = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            ...headers,
            Prefer: 'resolution=merge-duplicates,return=minimal',
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return fail('Failed to sync profile');
        return ok({ success: true });
      }

      // -------------------------------------------------------------
      case 'addReview': {
        const { review } = body as { review: Record<string, any> };
        if (!review?.product_id) return corsError(400, 'product_id required', requestOrigin);
        const res = await fetch(`${supabaseUrl}/rest/v1/reviews`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({
            product_id: review.product_id,
            user_id: review.user_id ?? null,
            author_name: review.author_name ?? null,
            rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
            comment: review.comment ?? null,
          }),
        });
        if (!res.ok) return fail('Failed to submit review');
        return ok({ success: true });
      }

      // -------------------------------------------------------------
      case 'fetchReviews': {
        const { productId } = body;
        if (!productId) return corsError(400, 'productId required', requestOrigin);
        const res = await fetch(
          `${supabaseUrl}/rest/v1/reviews?product_id=eq.${encodeURIComponent(productId)}&order=created_at.desc&select=*`,
          { headers }
        );
        const reviews = res.ok ? await res.json() : [];
        // Attach author info from profiles (fallback to stored author_name).
        const userIds = (reviews as any[])
          .map((r) => r.user_id)
          .filter(Boolean);
        let profiles: any[] = [];
        if (userIds.length > 0) {
          const inFilter = userIds.map((id) => `"${id}"`).join(',');
          const profilesRes = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=in.(${inFilter})&select=*`,
            { headers }
          );
          if (profilesRes.ok) profiles = await profilesRes.json();
        }
        const profileMap = new Map(profiles.map((p) => [p.id, p]));
        const result = (reviews as any[]).map((review) => {
          const profile = profileMap.get(review.user_id);
          return {
            ...review,
            profiles: {
              full_name: review.author_name || profile?.full_name || null,
              avatar_url: profile?.avatar_url || null,
            },
          };
        });
        return ok({ reviews: result });
      }

      // -------------------------------------------------------------
      case 'subscribeNewsletter': {
        const { email } = body;
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          return corsError(400, 'Valid email required', requestOrigin);
        }
        const res = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ email: email.toLowerCase().trim(), created_at: new Date().toISOString() }),
        });
        if (!res.ok) return fail('Failed to subscribe');
        return ok({ success: true });
      }

      // -------------------------------------------------------------
      default:
        return corsError(400, `Unknown action: ${action}`, requestOrigin);
    }
  } catch (error) {
    console.error('User ops error:', error);
    return corsError(500, 'Internal Server Error', requestOrigin);
  }
};
