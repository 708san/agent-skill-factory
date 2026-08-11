import { requireAuth, json, errorResponse, readJson } from '../lib/http.js';
import { repoForVisibility, config } from '../lib/config.js';
import { deleteTextFile } from '../lib/github.js';
export default { async fetch(request) {
  try {
    requireAuth(request);
    if (request.method !== 'POST') return errorResponse(new Error('POST required'), 405);
    const body = await readJson(request);
    const repo = body.target === 'factory' ? config().factoryRepo : repoForVisibility(body.visibility);
    if (!body.path || body.path.includes('..') || body.path.startsWith('/')) throw new Error('Invalid path');
    const r = await deleteTextFile(repo, body.path, body.branch, body.message);
    return json({ ok: true, repository: `${config().owner}/${repo}`, path: body.path, commit: r.commit?.sha });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
