import { handler } from '../netlify/functions/submit-sell';
import { runHandler } from './_lib/adapter';

export default async function submitSellFn(req: any, res: any) {
  return runHandler(handler, req, res);
}
