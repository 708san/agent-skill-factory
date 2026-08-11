import { config } from './config.js';

export function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export function errorResponse(error, status = 400) {
  return json({ ok: false, error: error?.message || String(error) }, status);
}

export function requireAuth(request) {
  const expected = `Bearer ${config().actionKey}`;
  const actual = request.headers.get('authorization');
  if (!actual || actual !== expected) throw new Error('Unauthorized');
}

export async function readJson(request) {
  try { return await request.json(); }
  catch { throw new Error('Request body must be valid JSON'); }
}
