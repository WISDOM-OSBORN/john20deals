import { Handler } from '@netlify/functions';

const ALLOWED_ORIGINS = [
  'https://john20deals.netlify.app',
  'https://john20-deals.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

function getOrigin(requestOrigin: string | undefined): string {
  return requestOrigin || 'unknown';
}

function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin);
}

function errorResponse(statusCode: number, message: string, origin: string) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
    body: JSON.stringify({ error: message }),
  };
}

export const handler: Handler = async (event) => {
  const requestOrigin = getOrigin(event.headers?.origin || event.headers?.['Origin']);

  if (event.httpMethod === 'OPTIONS') {
    if (!isAllowedOrigin(requestOrigin)) return { statusCode: 403, body: 'Forbidden' };
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': requestOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'Method Not Allowed', requestOrigin);
  }

  if (!isAllowedOrigin(requestOrigin)) {
    return errorResponse(403, 'Origin not allowed', requestOrigin);
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
      imageUrls,
    } = body;

    if (!userId || !userName || !userPhone) {
      return errorResponse(400, "userId, userName and userPhone are required", requestOrigin);
    }
    if (!Array.isArray(imageUrls) || imageUrls.length > 3) {
      return errorResponse(400, "At most 3 images are allowed", requestOrigin);
    }
    if (userPhone && !/^\+?\d{8,15}$/.test(String(userPhone))) {
      return errorResponse(400, "Invalid phone number", requestOrigin);
    }

    if (!supabaseUrl || !supabaseKey) {
      return errorResponse(500, "Server configuration error", requestOrigin);
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
        image_url_1: imageUrls?.[0] || null,
        image_url_2: imageUrls?.[1] || null,
        image_url_3: imageUrls?.[2] || null,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase insert error (sell_requests):', errorText.slice(0, 500));
      return errorResponse(500, "Failed to save sell request", requestOrigin);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': requestOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
      },
      body: JSON.stringify({ success: true, sellRequestId: data[0]?.id }),
    };
  } catch (error) {
    console.error("Sell request submission error:", error);
    return errorResponse(500, "Internal Server Error", requestOrigin);
  }
};
