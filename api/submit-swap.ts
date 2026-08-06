import { handler } from '../netlify/functions/submit-swap';
import { runHandler } from './_adapter';

export default async function submitSwapFn(req: Request): Promise<Response> {
  return runHandler(handler, req);
}
