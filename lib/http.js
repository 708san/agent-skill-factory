import { config } from './config.js';
import { FactoryError, normalizeError, validationError } from './errors.js';
import { context, correlationHeaders } from './request-context.js';

export function json(data, status = 200, extraHeaders = {}) {
  const { requestId, operationId } = context();
  let payload = data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    payload = { ...data };
    if (operationId && payload.operationId === undefined) payload.operationId = operationId;
    if (payload.ok === false && payload.error && typeof payload.error === 'object' && !Array.isArray(payload.error)) {
      payload.error = {
        ...payload.error,
        requestId: payload.error.requestId || requestId || null,
        operationId: payload.error.operationId ?? operationId ?? null
      };
    }
  }
  return new Response(JSON.stringify(payload, null, 2), {
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
