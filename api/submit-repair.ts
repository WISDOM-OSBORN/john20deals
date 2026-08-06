import { handler } from '../netlify/functions/submit-repair';
import { runHandler } from './_adapter';

export default async function submitRepairFn(req: Request): Promise<Response> {
  return runHandler(handler, req);
}
