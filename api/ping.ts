export default async function ping(req: any, res: any) {
  const payload = {
    ok: true,
    method: typeof req?.method === 'string' ? req.method : 'none',
    hasText: typeof req?.text === 'function',
    hasBodyObject: req?.body !== undefined && typeof req?.body === 'object',
    hasBodyString: typeof req?.body === 'string',
    hasEnd: typeof res?.end === 'function',
    hasStatus: typeof res?.status === 'function',
    keys: req ? Object.keys(req).slice(0, 10) : [],
  };
  res.status(200);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}