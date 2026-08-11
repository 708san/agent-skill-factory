import { requireAuth, json, errorResponse, readJson } from '../lib/http.js';
import { validateSkillText } from '../lib/skills.js';
import { scanSecrets } from '../lib/security.js';
export default { async fetch(request) {
  try {
    requireAuth(request);
    if (request.method !== 'POST') return errorResponse(new Error('POST required'), 405);
    const body = await readJson(request);
    const structure = validateSkillText(body.skillMd || '');
    const secrets = scanSecrets(body.skillMd || '');
    return json({ ok: structure.ok && secrets.ok, structure, secrets });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
