import { requireAuth, json, errorResponse } from '../lib/http.js';
import { getSkill } from '../lib/skills.js';
export default { async fetch(request) {
  try {
    requireAuth(request);
    const u = new URL(request.url);
    const visibility = u.searchParams.get('visibility');
    const name = u.searchParams.get('name');
    const ref = u.searchParams.get('ref') || undefined;
    return json({ ok: true, ...(await getSkill(visibility, name, ref)) });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
