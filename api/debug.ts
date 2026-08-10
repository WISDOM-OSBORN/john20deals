// TEMPORARY diagnostic - describes the req object Vercel passes to /api functions
import type { IncomingMessage, ServerResponse } from 'node:http';

function attempt<T>(label: string, fn: () => Promise<T> | T): Promise<{ label: string; value?: any; error?: string }> {
  return Promise.resolve()
    .then(async () => ({ label, value: await fn() }))
    .catch((e: any) => ({ label, error: `${e?.name || 'Error'}: ${e?.message || e}` }));
}

export default async function (req: IncomingMessage, res: ServerResponse) {
  const keys = Object.keys(req as any).slice(0, 40);
  const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(req)).slice(0, 60);
  const hasText = typeof (req as any).text === 'function';
  const hasOn = typeof req.on === 'function';
  const bodyType = typeof (req as any).body;

  const results: any[] = [];
  results.push(
    await attempt('typeof.req', () => typeof req),
    await attempt('constructor', () => (req as any).constructor?.name),
    await attempt('method', () => (req as any).method),
    await attempt('url', () => (req as any).url),
    await attempt('headers.host', () => (req as any).headers?.host),
    await attempt('headers.content-type', () => (req as any).headers?.['content-type']),
    await attempt('hasText', () => hasText),
    await attempt('hasOn', () => hasOn),
    await attempt('req.body type', () => bodyType),
  );

  if (hasText) {
    results.push(await attempt('await req.text()', async () => { const t = await (req as any).text(); return typeof t === 'string' ? t.slice(0, 200) : t; }));
  }

  if (hasOn) {
    results.push(
      await attempt('stream read', () => new Promise((resolve, reject) => {
        const chunks: any[] = [];
        const timer = setTimeout(() => reject(new Error('stream timeout')), 3000);
        (req as any).on('data', (c: any) => chunks.push(c));
        (req as any).on('end', () => { clearTimeout(timer); resolve(Buffer.concat(chunks).toString('utf8')); });
        (req as any).on('error', (e: any) => { clearTimeout(timer); reject(e); });
      }))
    );
  }

  if (bodyType === 'string') {
    results.push(await attempt('req.body (string)', () => ((req as any).body as string).slice(0, 200)));
  } else if (bodyType === 'object' && (req as any).body) {
    results.push(await attempt('req.body (object)', () => JSON.stringify((req as any).body).slice(0, 200)));
  }

  const payload = {
    results,
    proto,
    keys,
    hasBodyLike: ['body', 'rawBody', 'rawbody', 'payload'].filter((k) => k in req),
  };

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload, null, 2));
}