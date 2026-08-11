import { requireAuth, json, errorResponse, readJson } from '../lib/http.js';
import { repoForVisibility, config } from '../lib/config.js';
import { createPullRequest } from '../lib/github.js';
export default { async fetch(request) {
  try {
    requireAuth(request);
    if (request.method !== 'POST') return errorResponse(new Error('POST required'), 405);
    const body = await readJson(request);
    const repo = body.target === 'factory' ? config().factoryRepo : repoForVisibility(body.visibility);
    const pr = await createPullRequest(repo, body.head, body.title, body.body, body.base || config().baseBranch);
    return json({ ok: true, repository: `${config().owner}/${repo}`, number: pr.number, title: pr.title, url: pr.html_url });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
