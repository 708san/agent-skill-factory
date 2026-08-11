import { requireAuth, json, errorResponse } from '../lib/http.js';
import { getSkillFile } from '../lib/skills.js';
export default { async fetch(request) {
  try {
    requireAuth(request);
    const u = new URL(request.url);
    const visibility = u.searchParams.get('visibility');
    const name = u.searchParams.get('name');
    const path = u.searchParams.get('path');
    const ref = u.searchParams.get('ref') || undefined;
    return json({ ok: true, ...(await getSkillFile(visibility, name, path, ref)) });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
