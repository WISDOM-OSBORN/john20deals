import { Handler } from '@netlify/functions';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Assuming these environment variables are provided
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'product-images';
const publicUrlBase = process.env.R2_PUBLIC_URL || `https://${bucketName}.r2.cloudflarestorage.com`;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: 'Method Not Allowed',
    };
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
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "productId and userId are required" }),
      };
    }

    // Since RLS is disabled, we could just use the Supabase REST API via fetch
    // to insert the row.
    const response = await fetch(`${supabaseUrl}/rest/v1/swap_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey as string,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        user_name: userName,
        user_phone: userPhone,
        product_id: productId,
        product_name: productName,
        offer_description: description,
        image_url_1: imageUrls?.[0] || null,
        image_url_2: imageUrls?.[1] || null,
        image_url_3: imageUrls?.[2] || null,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase insert error:', errorText);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Failed to save swap request" }),
      };
    }

    const data = await response.json();

    // Send WhatsApp notification using a third-party API if required, 
    // or just rely on Admin dashboard.
    // For now, we will log it as requested by the roadmap but the actual 
    // sending depends on what API they use for WhatsApp.
    console.log(`New Swap Request!
        From: ${userName} (${userPhone})
        Wants to swap for: ${productName}
        Description: ${description}
        Images:
        ${imageUrls?.[0] || 'None'}
        ${imageUrls?.[1] || 'None'}
        ${imageUrls?.[2] || 'None'}`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, swapRequestId: data[0]?.id }),
    };

  } catch (error) {
    console.error("Swap request submission error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
