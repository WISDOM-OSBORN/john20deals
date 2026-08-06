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
      userId,
      userName,
      userPhone,
      deviceType,
      brand,
      model,
      condition,
      description,
      expectedPrice,
      imageUrls,
    } = body;

    if (!userId || !userName || !userPhone) {
      return corsError(400, "userId, userName and userPhone are required", requestOrigin);
    }
    if (!Array.isArray(imageUrls) || imageUrls.length > 3) {
      return corsError(400, "At most 3 images are allowed", requestOrigin);
    }
    if (userPhone && !/^\+?\d{8,15}$/.test(String(userPhone))) {
      return corsError(400, "Invalid phone number", requestOrigin);
    }

    const offerPrice =
      expectedPrice != null && expectedPrice !== '' && !isNaN(Number(expectedPrice))
        ? Number(expectedPrice)
        : null;

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    if (!supabaseUrl || !supabaseKey) {
      return corsError(500, "Server configuration error", requestOrigin);
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/sell_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        user_name: userName,
        user_phone: userPhone,
        device_type: deviceType || null,
        brand: brand || null,
        model: model || null,
        condition: condition || null,
        description: description || null,
        offer_price: offerPrice,
        image_url_1: imageUrls?.[0] || null,
        image_url_2: imageUrls?.[1] || null,
        image_url_3: imageUrls?.[2] || null,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase insert error (sell_requests):', errorText.slice(0, 500));
      return corsError(500, "Failed to save sell request", requestOrigin);
    }

    const data = await response.json();

    await notifyAdmins({
      type: 'sell',
      title: 'New sell request',
      message: `${userName || 'A customer'} wants to sell a ${[brand, model].filter(Boolean).join(' ') || deviceType || 'device'}.`,
    });

    return {
      statusCode: 200,
      headers: corsHeaders(requestOrigin),
      body: JSON.stringify({ success: true, sellRequestId: data[0]?.id }),
    };
  } catch (error) {
    console.error("Sell request submission error:", error);
    return corsError(500, "Internal Server Error", requestOrigin);
  }
};
