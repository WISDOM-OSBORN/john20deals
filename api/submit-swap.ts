import { handler } from '../netlify/functions/submit-swap';
import { runHandler } from './_lib/adapter';

export default async function submitSwapFn(req: any, res: any) {
  return runHandler(handler, req, res);
}
