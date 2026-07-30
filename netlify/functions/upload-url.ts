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
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { filename, contentType } = JSON.parse(event.body || '{}');
    
    if (!filename || !contentType) {
      return { statusCode: 400, body: JSON.stringify({ error: "filename and contentType are required" }) };
    }

    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${filename}`;
    const bucketName = process.env.R2_BUCKET_NAME || '';

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300,
      signableHeaders: new Set(['content-type'])
    });

    const publicUrl = process.env.R2_PUBLIC_URL 
      ? `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`
      : `https://${bucketName}.r2.cloudflarestorage.com/${uniqueFileName}`; 

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: signedUrl, publicUrl })
    };
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to generate upload URL" }) };
  }
};
