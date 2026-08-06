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

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  condition?: string;
  image_url?: string | null;
}

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
      items,
      deliveryMethod,
      shippingAddress,
    } = body;

    if (!userId) {
      return corsError(400, "userId is required", requestOrigin);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return corsError(400, "Order must contain at least one item", requestOrigin);
    }

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    if (!supabaseUrl || !supabaseKey) {
      return corsError(500, "Server configuration error", requestOrigin);
    }

    const post = (path: string, payload: any, prefer = 'return=representation') =>
      fetch(`${supabaseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': prefer,
        },
        body: JSON.stringify(payload),
      });

    // 1. Fetch current stock for each item and validate.
    const productIds = [...new Set(items.map((i: OrderItem) => i.id))];
    const idList = productIds.map((id) => `"${id}"`).join(',');
    const stockResponse = await fetch(
      `${supabaseUrl}/rest/v1/products?id=in.(${idList})&select=id,name,stock,price`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!stockResponse.ok) {
      return corsError(500, "Failed to validate stock", requestOrigin);
    }

    const stockData = await stockResponse.json();
    const stockMap: Record<string, any> = {};
    for (const row of stockData || []) {
      stockMap[row.id] = row;
    }

    for (const item of items as OrderItem[]) {
      const product = stockMap[item.id];
      if (!product) {
        return corsError(400, `${item.name || 'An item'} is no longer available.`, requestOrigin);
      }
      if ((product.stock ?? 0) < item.quantity) {
        return corsError(
          400,
          `Only ${product.stock} in stock for ${product.name}. Please reduce the quantity.`,
          requestOrigin
        );
      }
    }

    // 2. Decrement stock for each item.
    const stockErrors: string[] = [];
    for (const item of items as OrderItem[]) {
      const product = stockMap[item.id];
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/products?id=eq.${item.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ stock: (product.stock ?? 0) - item.quantity }),
        }
      );
      if (!updateResponse.ok) {
        stockErrors.push(item.id);
      }
    }

    if (stockErrors.length > 0) {
      console.error('Failed to decrement stock for:', stockErrors.join(', '));
    }

    // 3. Create the order.
    const totalPrice = (items as OrderItem[]).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderResponse = await post('/rest/v1/orders', {
      user_id: userId,
      products: items,
      total_price: totalPrice,
      status: 'pending',
      delivery_method: deliveryMethod || 'pickup',
      shipping_address:
        shippingAddress || (deliveryMethod === 'pickup' ? 'Pickup in Store' : null),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Supabase insert error (orders):', errorText.slice(0, 500));
      return corsError(500, "Failed to create order reference. Please try again.", requestOrigin);
    }

    const orderData = await orderResponse.json();

    await notifyAdmins({
      type: 'order',
      title: 'New order placed',
      message: `A new order worth ${formatGhs(totalPrice)} was placed. Review it in the Orders tab.`,
    });

    return {
      statusCode: 200,
      headers: corsHeaders(requestOrigin),
      body: JSON.stringify({ success: true, orderId: orderData[0]?.id, totalPrice }),
    };
  } catch (error) {
    console.error("Order submission error:", error);
    return corsError(500, "Internal Server Error", requestOrigin);
  }
};

function formatGhs(amount: number): string {
  return `GH₵ ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
