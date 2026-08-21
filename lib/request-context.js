import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const storage = new AsyncLocalStorage();

export function runWithRequestContext(request, fn) {
  const requestId = cleanId(request.headers.get('x-request-id')) || randomUUID();
  const operationId = isMutation(request.method) ? (cleanId(request.headers.get('x-operation-id')) || randomUUID()) : null;
  return storage.run({ requestId, operationId }, fn);
}

export function context() { return storage.getStore() || {}; }
export function correlationHeaders() {
  const { requestId, operationId } = context();
  return Object.fromEntries([['x-request-id', requestId], ['x-operation-id', operationId]].filter(([, v]) => v));
}
export function logEvent(event, fields = {}) {
  const { requestId, operationId } = context();
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, requestId: requestId || null, operationId: operationId || null, ...fields }));
}
function isMutation(method) { return !['GET', 'HEAD', 'OPTIONS'].includes(String(method || '').toUpperCase()); }
function cleanId(value) { return typeof value === 'string' && /^[A-Za-z0-9._:-]{1,128}$/.test(value) ? value : null; }
