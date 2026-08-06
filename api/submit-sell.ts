import { handler } from '../netlify/functions/submit-sell';
import { runHandler } from './_adapter';

export default async function submitSellFn(req: Request): Promise<Response> {
  return runHandler(handler, req);
}
