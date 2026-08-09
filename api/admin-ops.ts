import { handler } from '../netlify/functions/admin-ops';
import { runHandler } from './_lib/adapter';

export default async function adminOpsFn(req: any, res: any) {
  return runHandler(handler, req, res);
}
