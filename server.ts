import express from "express";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServer as createViteServer } from "vite";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Initialize S3 Client for Cloudflare R2
  // Make sure these environment variables are set
  const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

  app.use(express.json());

  // API route for generating a presigned URL (Used in dev environment)
  app.post("/api/upload", async (req, res) => {
    try {
      const { filename, contentType } = req.body;
      if (!filename || !contentType) {
        return res.status(400).json({ error: "filename and contentType are required" });
      }

      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${filename}`;
      const bucketName = process.env.R2_BUCKET_NAME || '';

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

      const publicUrl = process.env.R2_PUBLIC_URL 
        ? `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`
        : `https://${bucketName}.r2.cloudflarestorage.com/${uniqueFileName}`; 

      res.json({ uploadUrl: signedUrl, publicUrl });
    } catch (error) {
      console.error("Presigned URL error:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
