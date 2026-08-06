import type { Handler } from '@netlify/functions';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  isAllowedOrigin,
  corsHeaders,
  corsPreflight,
  corsError,
  getRequestOrigin,
} from './shared/cors';
import { getClientIp, isRateLimited } from './shared/rate-limit';

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

// Whitelist of accepted image content types.
const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Maximum upload size in bytes (10 MB).
const MAX_FILE_SIZE = 10 * 1024 * 1024;

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

  try {
    const body = JSON.parse(event.body || '{}');
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return corsError(400, "filename and contentType are required", requestOrigin);
    }

    const ext = ALLOWED_CONTENT_TYPES[contentType];
    if (!ext) {
      return corsError(400, "Only JPEG, PNG, WEBP and GIF images are allowed", requestOrigin);
    }

    // Sanitize the filename: strip path separators and weird characters.
    const safeBase = String(filename)
      .split(/[\\/]/)
      .pop()
      ?.replace(/[^a-zA-Z0-9._-]/g, '-')
      .slice(0, 60) || 'image';

    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${safeBase}${ext}`;
    const bucketName = process.env.R2_BUCKET_NAME || '';

    const expectedSize = Number(body.expectedSize);
    if (Number.isFinite(expectedSize) && expectedSize > MAX_FILE_SIZE) {
      return corsError(413, "File is too large (max 10 MB)", requestOrigin);
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
      headers: corsHeaders(requestOrigin),
      body: JSON.stringify({ uploadUrl: signedUrl, publicUrl, maxSizeBytes: MAX_FILE_SIZE }),
    };
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return corsError(500, "Failed to generate upload URL", requestOrigin);
  }
};
