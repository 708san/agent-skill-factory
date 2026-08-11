import { requireAuth, json, errorResponse } from '../lib/http.js';
import { repoForVisibility, config } from '../lib/config.js';
import { listCommitsForPath } from '../lib/github.js';
export default { async fetch(request) {
  try {
    requireAuth(request);
    const u = new URL(request.url);
    const target = u.searchParams.get('target');
    const visibility = u.searchParams.get('visibility');
    const name = u.searchParams.get('name');
    if (!name) throw new Error('name is required');
    const repo = target === 'factory' ? config().factoryRepo : repoForVisibility(visibility);
    const basePath = target === 'factory' ? `factory/${name}` : `skills/${name}`;
    const commits = await listCommitsForPath(repo, basePath, u.searchParams.get('ref') || undefined);
    return json({ ok: true, commits: commits.map((c) => ({ sha: c.sha, message: c.commit?.message, date: c.commit?.author?.date, url: c.html_url })) });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
