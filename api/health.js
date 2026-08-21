import { json } from '../lib/http.js';
import { runWithRequestContext, logEvent } from '../lib/request-context.js';
export default { async fetch(request) { return runWithRequestContext(request, async () => { logEvent('request_complete', { route: 'health', method: request.method, status: 200 }); return json({ ok: true, service: 'agent-skill-factory', version: '0.9.0' }); }); } };
