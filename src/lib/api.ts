async function call(fn: 'admin-ops' | 'user-ops', payload: Record<string, any>): Promise<any> {
  const apiEndpoint = import.meta.env.PROD
    ? `/.netlify/functions/${fn}`
    : `/api/${fn}`;
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
