import { handler } from '../netlify/functions/user-ops';
import { runHandler } from './_adapter';

export default async function userOpsFn(req: Request): Promise<Response> {
  return runHandler(handler, req);
}
