import { requireAuth, json, errorResponse } from '../lib/http.js';
import { repoForVisibility, config } from '../lib/config.js';
import { compare } from '../lib/github.js';
export default { async fetch(request) {
  try {
    requireAuth(request);
    const u = new URL(request.url);
    const target = u.searchParams.get('target');
    const visibility = u.searchParams.get('visibility');
    const head = u.searchParams.get('head');
    const base = u.searchParams.get('base') || config().baseBranch;
    if (!head) throw new Error('head is required');
    const repo = target === 'factory' ? config().factoryRepo : repoForVisibility(visibility);
    const d = await compare(repo, base, head);
    return json({
      ok: true,
      repository: `${config().owner}/${repo}`,
      base, head,
      status: d.status,
      aheadBy: d.ahead_by,
      behindBy: d.behind_by,
      totalCommits: d.total_commits,
      files: (d.files || []).map((f) => ({ filename: f.filename, status: f.status, additions: f.additions, deletions: f.deletions, patch: f.patch || null }))
    });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
