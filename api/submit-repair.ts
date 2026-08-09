import { handler } from '../netlify/functions/submit-repair';
import { runHandler } from './_lib/adapter';

export default async function submitRepairFn(req: any, res: any) {
  return runHandler(handler, req, res);
}
