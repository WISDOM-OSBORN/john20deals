import type { Handler } from '@netlify/functions';

type HandlerResult = {
  statusCode?: number;
  headers?: Record<string, string>;
  body?: string;
};

// Runs a Netlify-style handler inside a Vercel (/api) serverless function.
//
// Vercel invokes /api functions as Node functions with a VercelRequest
// (req.body may already be a parsed object, req.headers is a plain object,
// and there is NO req.text()). Some environments pass a Web Request instead
// (which has req.text() and req.headers.forEach()). This adapter handles both:
// it builds the Netlify-style event our handlers expect, runs the handler, and
// writes the result through the Node `res` object when one is provided,
// otherwise returns a Web `Response`.
export async function runHandler<TReq = any, TRes = any>(
  handler: Handler,
  req: TReq,
  res?: TRes
): Promise<Response | void> {
  const rawReq = req as any;
  const hasWebBodyReader = typeof rawReq?.text === 'function';

  const method = hasWebBodyReader ? rawReq.method : (rawReq?.method || 'POST');
  let body = '';
  const headers: Record<string, string> = {};

  try {
    if (hasWebBodyReader) {
      body = await rawReq.text();
      if (rawReq.headers && typeof rawReq.headers.forEach === 'function') {
        rawReq.headers.forEach((value: string, key: string) => {
          headers[key] = value;
        });
      }
    } else {
      const rawBody = rawReq?.body;
      if (typeof rawBody === 'string') body = rawBody;
      else if (rawBody && typeof rawBody === 'object') body = JSON.stringify(rawBody);

      const httpHeaders = rawReq?.headers || {};
      for (const key of Object.keys(httpHeaders)) {
        const value = httpHeaders[key];
        headers[key] = Array.isArray(value) ? value.join(', ') : String(value ?? '');
      }
    }
  } catch (error: any) {
    console.error('[api] Failed to read request:', error);
    return respondWith({ statusCode: 400, headers: {}, body: JSON.stringify({ error: `Invalid request: ${error?.message || error}` }) }, res);
  }

  const event = {
    httpMethod: String(method || 'POST').toUpperCase(),
    headers,
    body,
    queryStringParameters: rawReq?.query || {},
  };

  let result: HandlerResult;
  try {
    result = (await handler(event as any, {} as any)) as any;
  } catch (error: any) {
    console.error('[api] Handler threw:', error);
    return respondWith(
      {
        statusCode: 500,
        headers: {},
        body: JSON.stringify({ error: `Handler error: ${error?.message || error}` }),
      },
      res
    );
  }

  const statusCode = result?.statusCode || 200;
  const responseBody = result?.body || '';

  const applyHeaders = (target: Record<string, unknown>) => {
    const resultHeaders = { ...(result?.headers || {}) };
    if (!('Content-Type' in resultHeaders) && responseBody) {
      resultHeaders['Content-Type'] = 'application/json';
    }
    for (const [key, value] of Object.entries(resultHeaders)) {
      target[key] = value;
    }
  };

  if (res && typeof (res as any).end === 'function') {
    const nodeRes = res as any;
    if (typeof nodeRes.status === 'function') nodeRes.status(statusCode);
    else nodeRes.statusCode = statusCode;
    applyHeaders(nodeRes);
    nodeRes.end(responseBody);
    return;
  }

  const responseHeaders = new Headers();
  applyHeaders(responseHeaders as unknown as Record<string, unknown>);
  return new Response(responseBody, { status: statusCode, headers: responseHeaders });
}

function respondWith(
  result: HandlerResult,
  res: any
): Response | void {
  const statusCode = result.statusCode || 500;
  const responseBody = result.body || '';

  const applyHeaders = (target: Record<string, unknown>) => {
    const resultHeaders = { ...(result.headers || {}) };
    if (!('Content-Type' in resultHeaders) && responseBody) {
      resultHeaders['Content-Type'] = 'application/json';
    }
    for (const [key, value] of Object.entries(resultHeaders)) {
      target[key] = value;
    }
  };

  if (res && typeof res.end === 'function') {
    if (typeof res.status === 'function') res.status(statusCode);
    else res.statusCode = statusCode;
    applyHeaders(res);
    res.end(responseBody);
    return;
  }

  const responseHeaders = new Headers();
  applyHeaders(responseHeaders as unknown as Record<string, unknown>);
  return new Response(responseBody, { status: statusCode, headers: responseHeaders });
}