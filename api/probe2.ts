import { isAllowedOrigin } from '../netlify/functions/shared/cors';
import { isRateLimited } from '../netlify/functions/shared/rate-limit';

export default async function probe2(req: any, res: any) {
  const out = {
    corsLoaded: true,
    rateLimitLoaded: true,
    corsCheck: isAllowedOrigin('https://example.com', undefined),
    rateCheck: isRateLimited('probe2'),
  };
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(out));
  return undefined;
}