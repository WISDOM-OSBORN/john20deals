import type { Handler } from '@netlify/functions';

// Runs a Netlify-style handler inside a Vercel serverless function.
// Vercel functions receive a Web `Request` and must return a Web `Response`,
// while our handlers expect a Netlify event and return { statusCode, headers, body }.
export async function runHandler(handler: Handler, req: Request): Promise<Response> {
  const bodyText = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const event = {
    httpMethod: req.method || 'POST',
    headers,
    body: bodyText,
    queryStringParameters: {},
  };

  const result = (await handler(event as any, {} as any)) as {
    statusCode: number;
    headers?: Record<string, string>;
    body?: string;
  };

  const responseHeaders = new Headers();
  if (result.headers) {
    Object.entries(result.headers).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
  }

  return new Response(result.body || '', {
    status: result.statusCode || 200,
    headers: responseHeaders,
  });
}
