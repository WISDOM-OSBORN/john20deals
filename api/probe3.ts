import { getSupabaseConfig } from '../netlify/functions/shared/notify-admin';

export default async function probe3(req: any, res: any) {
  const out = {
    notifyAdminLoaded: true,
    supabaseUrl: (getSupabaseConfig().supabaseUrl || '').slice(0, 40) || 'EMPTY',
    supabaseKey: (getSupabaseConfig().supabaseKey || '').slice(0, 8) || 'EMPTY',
  };
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(out));
  return undefined;
}