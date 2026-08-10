import type { Handler } from '@netlify/functions';

type HandlerResult = {
  statusCode?: number;
  headers?: Record<string, string>;
  body?: string;
};

// Runs a Netlify-style handler inside a Vercel (/api) serverless function.
//
// Vercel invokes /api functions as Node functions with a raw Node req/res
// (req is an http.IncomingMessage with no req.text() and no pre-parsed
// req.body, res is an http.ServerResponse with no res.status()). Some
// environments pass a Web Request instead (req.text()/req.headers.forEach()).
// This adapter handles both: it builds the Netlify-style event our handlers
// expect (reading the body stream), runs the handler, and writes the result
// through the Node `res` object when one is provided, otherwise returns a Web
// `Response`.
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
      if (typeof rawReq?.body === 'string') body = rawReq.body;
      else if (rawReq?.body && typeof rawReq.body === 'object') {
        body = JSON.stringify(rawReq.body);
      } else {
        body = await readStream(rawReq);
      }

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
    result = ((await handler(event as any, {} as any)) as any) || {
      statusCode: 500,
      headers: {},
      body: JSON.stringify({ error: 'Handler returned no response' }),
    };
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
    if (typeof nodeRes.statusCode === 'number') nodeRes.statusCode = statusCode;
    if (typeof nodeRes.status === 'function') nodeRes.status(statusCode);
    applyHeaders(nodeRes);
    nodeRes.end(responseBody);
    return;
  }

  const responseHeaders = new Headers();
  applyHeaders(responseHeaders as unknown as Record<string, unknown>);
  return new Response(responseBody, { status: statusCode, headers: responseHeaders });
}

function readStream(req: any): Promise<string> {
  return new Promise((resolve) => {
    if (!req || typeof req.on !== 'function') return resolve('');
    const chunks: any[] = [];
    req.on('data', (c: any) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(''));
  });
}

function respondWith(result: HandlerResult, res: any): Response | void {
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
    if (typeof res.statusCode === 'number') res.statusCode = statusCode;
    if (typeof res.status === 'function') res.status(statusCode);
    applyHeaders(res);
    res.end(responseBody);
    return;
  }

  const responseHeaders = new Headers();
  applyHeaders(responseHeaders as unknown as Record<string, unknown>);
  return new Response(responseBody, { status: statusCode, headers: responseHeaders });
}