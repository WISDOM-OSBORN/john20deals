import { handler } from '../netlify/functions/submit-order';
import { runHandler } from './_lib/adapter';

export default async function submitOrderFn(req: any, res: any) {
  return runHandler(handler, req, res);
}
