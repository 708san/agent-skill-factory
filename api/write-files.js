import { requireAuth, json, errorResponse, readJson } from '../lib/http.js';
import { repoForVisibility, config } from '../lib/config.js';
import { putTextFile } from '../lib/github.js';
import { scanSecrets } from '../lib/security.js';

export default { async fetch(request) {
  try {
    requireAuth(request);
    if (request.method !== 'POST') return errorResponse(new Error('POST required'), 405);
    const body = await readJson(request);
    const repo = body.target === 'factory' ? config().factoryRepo : repoForVisibility(body.visibility);
    if (!body.branch) throw new Error('branch is required');
    if (!Array.isArray(body.files) || !body.files.length) throw new Error('files[] is required');
    const results = [];
    for (const file of body.files) {
      if (!file.path || typeof file.content !== 'string') throw new Error('Each file needs path and content');
      if (file.path.includes('..') || file.path.startsWith('/')) throw new Error(`Invalid path: ${file.path}`);
      const sec = scanSecrets(file.content);
      if (!sec.ok) throw new Error(`Secret-like content detected in ${file.path}`);
      const r = await putTextFile(repo, file.path, file.content, body.branch, body.message || `Update ${file.path}`);
      results.push({ path: file.path, commit: r.commit?.sha, contentSha: r.content?.sha });
    }
    return json({ ok: true, repository: `${config().owner}/${repo}`, branch: body.branch, files: results });
  } catch (e) { return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400); }
}};
