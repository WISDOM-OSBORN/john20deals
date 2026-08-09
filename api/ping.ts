export default async function ping(req: any, res: any) {
  const payload: any = {
    ok: true,
    method: typeof req?.method === 'string' ? req.method : 'none',
    hasText: typeof req?.text === 'function',
    bodyType: req?.body === undefined ? 'undefined' : typeof req.body,
    reqKeys: Object.keys(req || {}).slice(0, 20),
    resKeys: Object.keys(res || {}).slice(0, 20),
  };
  try {
    if (typeof req?.body === 'string') payload.bodySnippet = req.body.slice(0, 80);
    else if (req?.body !== undefined) payload.bodySnippet = JSON.stringify(req.body).slice(0, 80);

    if (typeof res?.status === 'function') res.status(200);
    else res.statusCode = 200;
    if (typeof res?.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify(payload));
  } catch (e: any) {
    try {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: String(e?.stack || e) }));
    } catch {
      /* response channel already dead */
    }
  }
}