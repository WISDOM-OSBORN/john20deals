import { handler } from '../netlify/functions/upload-url';
import { runHandler } from './_adapter';

export default async function uploadFn(req: Request): Promise<Response> {
  return runHandler(handler, req);
}
