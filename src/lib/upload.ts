export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
 * Uploads an image to Cloudflare R2 via a presigned URL and returns the
 * public URL. Throws an Error with a user-friendly message on failure.
 */
export async function uploadImage(file: File): Promise<string> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const apiEndpoint = import.meta.env.PROD ? '/.netlify/functions/upload-url' : '/api/upload';

  const urlResponse = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      expectedSize: file.size,
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
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed (status ${uploadResponse.status}).`);
  }

  return publicUrl;
}
