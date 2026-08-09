import { handler } from '../netlify/functions/upload-url';
import { runHandler } from './_lib/adapter';

export default async function uploadFn(req: any, res: any) {
  return runHandler(handler, req, res);
}
