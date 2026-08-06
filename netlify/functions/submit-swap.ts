import { Handler } from '@netlify/functions';
import {
  isAllowedOrigin,
  corsHeaders,
  corsPreflight,
  corsError,
  getRequestOrigin,
} from './shared/cors';
import { getClientIp, isRateLimited } from './shared/rate-limit';
import { notifyAdmins, getSupabaseConfig } from './shared/notify-admin';

export const handler: Handler = async (event) => {
  const requestOrigin = getRequestOrigin(event);

  if (event.httpMethod === 'OPTIONS') {
    if (!isAllowedOrigin(requestOrigin)) return { statusCode: 403, body: 'Forbidden' };
    return corsPreflight(requestOrigin);
  }

  if (event.httpMethod !== 'POST') {
    return corsError(405, 'Method Not Allowed', requestOrigin);
  }

  if (!isAllowedOrigin(requestOrigin)) {
    return corsError(403, 'Origin not allowed', requestOrigin);
  }

  const ip = getClientIp(event);
  if (isRateLimited(ip)) {
    return corsError(429, 'Too many requests, please try again later', requestOrigin);
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      productId,
      productName,
      userId,
      userName,
      userPhone,
      description,
      imageUrls
    } = body;

    if (!productId || !userId) {
      return corsError(400, "productId and userId are required", requestOrigin);
    }
    if (!Array.isArray(imageUrls) || imageUrls.length > 3) {
      return corsError(400, "At most 3 images are allowed", requestOrigin);
    }
    if (userName && String(userName).length > 100) {
      return corsError(400, "Name is too long", requestOrigin);
    }
    if (userPhone && !/^\+?\d{8,15}$/.test(String(userPhone))) {
      return corsError(400, "Invalid phone number", requestOrigin);
    }
    if (description && String(description).length > 2000) {
      return corsError(400, "Description is too long (max 2000 chars)", requestOrigin);
    }

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    if (!supabaseUrl || !supabaseKey) {
      return corsError(500, "Server configuration error", requestOrigin);
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/swap_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        user_name: userName || null,
        user_phone: userPhone || null,
        product_id: productId,
        product_name: productName || null,
        offer_description: description || null,
        image_url_1: imageUrls?.[0] || null,
        image_url_2: imageUrls?.[1] || null,
        image_url_3: imageUrls?.[2] || null,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase insert error (swap_requests):', errorText.slice(0, 500));
      return corsError(500, "Failed to save swap request", requestOrigin);
    }

    const data = await response.json();

    // Automated in-app notification directed to the admin(s).
    await notifyAdmins({
      type: 'swap',
      title: 'New swap proposal',
      message: `${userName || 'A customer'} proposed a swap for ${productName || 'a product'}.`,
    });

    return {
      statusCode: 200,
      headers: corsHeaders(requestOrigin),
      body: JSON.stringify({ success: true, swapRequestId: data[0]?.id }),
    };

  } catch (error) {
    console.error("Swap request submission error:", error);
    return corsError(500, "Internal Server Error", requestOrigin);
  }
};
