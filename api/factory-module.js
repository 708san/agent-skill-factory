import { requireAuth, json, errorResponse } from '../lib/http.js';
import { getFactoryModule } from '../lib/skills.js';
export default { async fetch(request) {
  try {
    requireAuth(request);
    const u = new URL(request.url);
    const name = u.searchParams.get('name');
    const ref = u.searchParams.get('ref') || undefined;
    return json({ ok: true, ...(await getFactoryModule(name, ref)) });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
