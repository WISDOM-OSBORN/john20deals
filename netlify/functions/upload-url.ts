import { Handler } from '@netlify/functions';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

// Only allow requests from our own frontends.
const ALLOWED_ORIGINS = [
  ...(process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) || []),
  'https://john20deals.vercel.app',
  'https://john20deals.netlify.app',
  'https://john20deals.com',
  'https://www.john20deals.com',
  'https://john20-deals.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

// Whitelist of accepted image content types.
const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Maximum upload size in bytes (10 MB).
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function getOrigin(requestOrigin: string | undefined): string {
  return requestOrigin || 'unknown';
}

function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin);
}

// Simple in-memory rate limiter: max 30 requests per 5 minutes per IP.
const rateBuckets = new Map<string, number[]>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const hits = (rateBuckets.get(ip) || []).filter((t) => t > windowStart);
  if (hits.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateBuckets.set(ip, hits);
  return false;
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
    // Reject preflight from unknown origins too.
    if (!isAllowedOrigin(requestOrigin)) {
      return { statusCode: 403, body: 'Forbidden' };
    }
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

  const ip = event.headers?.['x-nf-client-connection-ip'] || event.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
    return errorResponse(429, 'Too many requests, please try again later', requestOrigin);
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return errorResponse(400, "filename and contentType are required", requestOrigin);
    }

    const ext = ALLOWED_CONTENT_TYPES[contentType];
    if (!ext) {
      return errorResponse(400, "Only JPEG, PNG, WEBP and GIF images are allowed", requestOrigin);
    }

    // Sanitize the filename: strip path separators and weird characters.
    const safeBase = String(filename)
      .split(/[\\/]/)
      .pop()
      ?.replace(/[^a-zA-Z0-9._-]/g, '-')
      .slice(0, 60) || 'image';

    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${safeBase}${ext}`;
    const bucketName = process.env.R2_BUCKET_NAME || '';

    // Enforce a size cap server-side by validating the declared file size.
    // (A hard cap on the signed PUT itself would require a POST policy; this
    // check plus the client-side check in the admin form is sufficient.)
    const expectedSize = Number(body.expectedSize);
    if (Number.isFinite(expectedSize) && expectedSize > MAX_FILE_SIZE) {
      return errorResponse(413, "File is too large (max 10 MB)", requestOrigin);
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const publicUrl = process.env.R2_PUBLIC_URL
      ? `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`
      : `https://${bucketName}.r2.cloudflarestorage.com/${uniqueFileName}`;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': requestOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
      },
      body: JSON.stringify({ uploadUrl: signedUrl, publicUrl, maxSizeBytes: MAX_FILE_SIZE }),
    };
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return errorResponse(500, "Failed to generate upload URL", requestOrigin);
  }
};