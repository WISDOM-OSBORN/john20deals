async function call(fn: 'admin-ops' | 'user-ops', payload: Record<string, any>): Promise<any> {
  // Same URL in every environment: Vercel serves /api/* natively, Netlify
  // redirects /api/* to the functions (netlify.toml), and the dev server
  // handles /api/* too.
  const apiEndpoint = `/api/${fn}`;
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export function adminOps(payload: Record<string, any>) {
  return call('admin-ops', payload);
}

export function userOps(payload: Record<string, any>) {
  return call('user-ops', payload);
}
