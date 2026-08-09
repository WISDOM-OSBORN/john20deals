import { handler } from '../netlify/functions/user-ops';

function streamToText(req: any): Promise<string> {
  return new Promise((resolve) => {
    const chunks: any[] = [];
    req.on('data', (c: any) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(''));
  });
}

export default async function probe1(req: any, res: any) {
  let raw = '';
  try {
    raw = await streamToText(req);
  } catch (e: any) {
    return finish(500, { streamError: String(e?.stack || e), raw }, res);
  }

  const out: any = { rawBody: raw.slice(0, 160) };
  try {
    const event = {
      httpMethod: String(req.method || 'POST').toUpperCase(),
      headers: req.headers || {},
      body: raw,
      queryStringParameters: {},
    };
    const result = (await handler(event as any, {} as any)) as any;
    out.resultStatusCode = result?.statusCode;
    out.resultBody = (result?.body || '').slice(0, 200);
  } catch (e: any) {
    out.handlerThrew = String(e?.stack || e);
  }
  return finish(200, out, res);
}

function finish(status: number, payload: any, res: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
  return undefined;
}