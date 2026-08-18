import { config } from './config.js';
import { FactoryError, normalizeError, validationError } from './errors.js';
import { correlationHeaders } from './request-context.js';

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...correlationHeaders(), ...extraHeaders }
  });
}

export function errorResponse(error, fallbackStatus = 500) {
  const normalized = normalizeError(error);
  return json({ ok: false, error: normalized.toJSON() }, normalized.status || fallbackStatus);
}

export function requireAuth(request) {
  const expected = `Bearer ${config().actionKey}`;
  const actual = request.headers.get('authorization');
  if (!actual || actual !== expected) throw new FactoryError('AUTH_INVALID', 'Authentication failed', { status: 401, operation: 'authenticate', stage: 'request' });
}

export async function readJson(request) {
  try { return await request.json(); }
  catch { throw validationError('Request body must be valid JSON', { operation: 'parse_request', stage: 'request' }); }
}
