// Shared helper to send automated in-app notifications to the store admins.
// Admin identity is resolved from the profiles table (role = 'admin') plus
// the legacy admin emails, so notifications always reach the directed person.

export interface AdminTarget {
  userId: string;
  email: string;
}

export function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  return { supabaseUrl, supabaseKey };
}

// Legacy admin emails kept in sync with src/context/AuthContext.tsx
const LEGACY_ADMIN_EMAILS = ['rockwellsan7@gmail.com', 'johndarkwah20@gmail.com'];

/**
 * Fetches the admin user ids from the profiles table.
 * Returns an empty array if the query fails (safe fallback).
 */
export async function fetchAdminTargets(): Promise<AdminTarget[]> {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const url = `${supabaseUrl}/rest/v1/profiles?role=eq.admin&select=id,email`;
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const byRole = Array.isArray(data) ? data : [];
    const emails = new Set<string>(byRole.map((p: any) => (p.email || '').toLowerCase()));
    for (const email of LEGACY_ADMIN_EMAILS) {
      if (!emails.has(email.toLowerCase())) byRole.push({ id: null, email });
    }
    return byRole.filter((p: any) => p.id || p.email) as AdminTarget[];
  } catch (error) {
    console.error('Failed to fetch admin targets:', error);
    return [];
  }
}

/**
 * Creates an in-app notification row for every admin found.
 * Called from the serverless submit functions (service role / anon).
 */
export async function notifyAdmins(input: {
  type: string;
  title: string;
  message?: string;
}): Promise<void> {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) return;

  const targets = await fetchAdminTargets();
  if (targets.length === 0) return;

  const payload = targets.map((t) => ({
    user_id: t.userId,
    type: input.type,
    title: input.title,
    message: input.message || null,
    read: false,
  }));

  try {
    await fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
}
