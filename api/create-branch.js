import { requireAuth, json, errorResponse, readJson } from '../lib/http.js';
import { repoForVisibility, config } from '../lib/config.js';
import { createBranch } from '../lib/github.js';
export default { async fetch(request) {
  try {
    requireAuth(request);
    if (request.method !== 'POST') return errorResponse(new Error('POST required'), 405);
    const body = await readJson(request);
    const repo = body.target === 'factory' ? config().factoryRepo : repoForVisibility(body.visibility);
    const branch = body.branch;
    await createBranch(repo, branch, body.base || config().baseBranch);
    return json({ ok: true, repository: `${config().owner}/${repo}`, branch });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
