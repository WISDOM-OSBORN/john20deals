// Shared CORS logic for all API functions (Netlify Functions + Vercel /api).
// Allowed origins come from:
//   1. Netlify's `process.env.URL` (the primary site URL)
//   2. Vercel's `process.env.VERCEL_URL` (the *.vercel.app deployment URL)
//   3. `process.env.ALLOWED_ORIGINS` (comma-separated list, add your custom
//      domain here in the dashboard)
//   4. Local development origins
//   5. Same-origin requests (origin matches the request Host header) - this
//      automatically supports any custom domain connected on either platform.
function defaultOrigins(): string[] {
  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const siteUrl = process.env.URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  return [
    ...(siteUrl ? [siteUrl] : []),
    ...(vercelUrl ? [vercelUrl] : []),
    ...envOrigins,
    'http://localhost:3000',
    'http://localhost:5173',
  ];
}

function isSameOrigin(requestOrigin: string, event: any): boolean {
  const host = event?.headers?.host || event?.headers?.['Host'];
  if (!host) return false;
  return requestOrigin === `https://${host}` || requestOrigin === `http://${host}`;
}

export function isAllowedOrigin(requestOrigin: string | undefined, event?: any): boolean {
  if (!requestOrigin) return false;
  return defaultOrigins().includes(requestOrigin) || isSameOrigin(requestOrigin, event);
}

export function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export function corsPreflight(origin: string) {
  return {
    statusCode: 204,
    headers: {
      ...corsHeaders(origin),
      'Access-Control-Max-Age': '86400',
    },
    body: '',
  };
}

export function corsError(statusCode: number, message: string, origin: string) {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: JSON.stringify({ error: message }),
  };
}

// Extracts the request origin, falling back to 'unknown'.
export function getRequestOrigin(event: any): string {
  return event.headers?.origin || event.headers?.['Origin'] || 'unknown';
}
