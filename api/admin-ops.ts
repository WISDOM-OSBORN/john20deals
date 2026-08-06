import { handler } from '../netlify/functions/admin-ops';
import { runHandler } from './_adapter';

export default async function adminOpsFn(req: Request): Promise<Response> {
  return runHandler(handler, req);
}
