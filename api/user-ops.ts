import { handler } from '../netlify/functions/user-ops';
import { runHandler } from './_lib/adapter';

export default async function userOpsFn(req: any, res: any) {
  return runHandler(handler, req, res);
}
