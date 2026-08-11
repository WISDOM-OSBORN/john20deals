export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// iPhone live camera photos are HEIC/HEIF. Browsers can rarely render them and
// our upload whitelist (client + server) only accepts jpeg/png/webp/gif, so
// convert them to JPEG first. Large photos are also downscaled/recompressed so
// they stay well under the 10 MB server cap even on slow connections.
const HEIC_LIKE = ['image/heic', 'image/heif'];
const REENCODE_OVER_SIZE = 8 * 1024 * 1024;
const MAX_LONG_EDGE = 2000;

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_UPLOAD_SIZE) {
    return 'File is too large. Maximum size is 10 MB.';
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, WEBP and GIF images are allowed.';
  }
  return null;
}

/**
 * Normalizes a photo for upload: re-encodes HEIC/HEIF and oversized images to a
 * downscaled JPEG (browser safe, server-whitelisted). Returns the best file to
 * upload; if conversion is impossible it returns the original so validation can
 * produce a clear error.
 */
export async function preparePhoto(file: File): Promise<File> {
  const needsConvert =
    HEIC_LIKE.includes(file.type.toLowerCase()) || file.size > REENCODE_OVER_SIZE;
  if (!needsConvert) return file;

  try {
    const bitmap = await readAsBitmap(file);
    const scale = Math.min(1, MAX_LONG_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.88)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.(heic|heif|jpg|jpeg|png|webp|gif)$/i, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

async function readAsBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to HTMLImageElement path
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = url;
    });
    // createImageBitmap expects an ImageBitmapSource; an HTMLImageElement works.
    return await createImageBitmap(img);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Uploads an image to Cloudflare R2 via a presigned URL and returns the
 * public URL. Throws an Error with a user-friendly message on failure.
 */
export async function uploadImage(file: File): Promise<string> {
  const prepared = await preparePhoto(file);

  const error = validateImageFile(prepared);
  if (error) throw new Error(error);

  const apiEndpoint = import.meta.env.PROD ? '/.netlify/functions/upload-url' : '/api/upload';

  const urlResponse = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: prepared.name,
      contentType: prepared.type,
      expectedSize: prepared.size,
    }),
  });

  if (!urlResponse.ok) {
    let message = 'Failed to get upload URL';
    try {
      const data = await urlResponse.json();
      message = data.error || message;
    } catch {
      message = `Server returned ${urlResponse.status}.`;
    }
    throw new Error(message);
  }

  let uploadUrl: string, publicUrl: string;
  try {
    const data = await urlResponse.json();
    uploadUrl = data.uploadUrl;
    publicUrl = data.publicUrl;
  } catch {
    throw new Error('Server returned an invalid response.');
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': prepared.type },
    body: prepared,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed (status ${uploadResponse.status}).`);
  }

  return publicUrl;
}