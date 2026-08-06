// Shared CORS logic for all Netlify functions.
// Allowed origins come from:
//   1. Netlify's `process.env.URL` (the primary site URL)
//   2. `process.env.ALLOWED_ORIGINS` (comma-separated list, add your custom
//      domain here in the Netlify dashboard)
//   3. Local development origins
function defaultOrigins(): string[] {
  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const siteUrl = process.env.URL;
  return [
    ...(siteUrl ? [siteUrl] : []),
    ...envOrigins,
    'http://localhost:3000',
    'http://localhost:5173',
  ];
}

export function isAllowedOrigin(requestOrigin: string | undefined): boolean {
  if (!requestOrigin) return false;
  return defaultOrigins().includes(requestOrigin);
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
