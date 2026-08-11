import { requireAuth, json, errorResponse } from '../lib/http.js';
import { listSkills } from '../lib/skills.js';
export default { async fetch(request) {
  try {
    requireAuth(request);
    const u = new URL(request.url);
    const visibility = u.searchParams.get('visibility');
    const ref = u.searchParams.get('ref') || undefined;
    return json({ ok: true, visibility, skills: await listSkills(visibility, ref) });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
