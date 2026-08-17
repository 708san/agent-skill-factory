import { config } from './config.js';

const API = 'https://api.github.com';

function headers() {
  return {
    'accept': 'application/vnd.github+json',
    'authorization': `Bearer ${config().token}`,
    'x-github-api-version': '2026-03-10',
    'content-type': 'application/json',
    'user-agent': 'agent-skill-factory-web'
  };
}

async function gh(path, options = {}) {
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = typeof data === 'object' && data?.message ? data.message : String(data || res.statusText);
    throw new Error(`GitHub ${res.status}: ${msg}`);
  }
  return data;
}

export async function getRepo(repo) {
  return gh(`/repos/${config().owner}/${repo}`);
}

export async function getContent(repo, path, ref) {
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : '';
  return gh(`/repos/${config().owner}/${repo}/contents/${encodePath(path)}${q}`);
}

export async function getTextFile(repo, path, ref) {
  const data = await getContent(repo, path, ref);
  if (Array.isArray(data)) throw new Error(`${path} is a directory`);
  if (!data.content) throw new Error(`No content returned for ${path}`);
  return {
    text: Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8'),
    sha: data.sha,
    path: data.path
  };
}

export async function listDirectory(repo, path = '', ref) {
  const data = await getContent(repo, path, ref);
  if (!Array.isArray(data)) throw new Error(`${path || '/'} is not a directory`);
  return data.map(({ name, path, type, sha }) => ({ name, path, type, sha }));
}

export async function getBranch(repo, branch) {
  return gh(`/repos/${config().owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
}

export async function getCommit(repo, ref) {
  if (typeof ref !== 'string' || !ref.trim()) throw new Error('ref is required');
  return gh(`/repos/${config().owner}/${repo}/commits/${encodeURIComponent(ref)}`);
}

export async function assertRefExists(repo, ref) {
  await getCommit(repo, ref);
  return true;
}

export async function createBranch(repo, branch, baseBranch = config().baseBranch) {
  if (!/^[A-Za-z0-9._\/-]+$/.test(branch)) throw new Error('Invalid branch name');
  if (branch === config().baseBranch) throw new Error('Refusing to create/change the base branch as a change branch');
  const base = await getBranch(repo, baseBranch);
  return gh(`/repos/${config().owner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha })
  });
}

export async function putTextFile(repo, path, content, branch, message) {
  if (!branch) throw new Error('branch is required');
  if (branch === config().baseBranch && !config().allowDirectMain) throw new Error('Direct writes to the base branch are disabled');
  let sha;
  try { sha = (await getTextFile(repo, path, branch)).sha; } catch (e) {
    if (!String(e.message).includes('GitHub 404')) throw e;
  }
  const body = {
    message: message || `Update ${path}`,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch,
    ...(sha ? { sha } : {})
  };
  return gh(`/repos/${config().owner}/${repo}/contents/${encodePath(path)}`, {
    method: 'PUT', body: JSON.stringify(body)
  });
}

export async function compare(repo, base, head) {
  return gh(`/repos/${config().owner}/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`);
}

export async function createPullRequest(repo, head, title, body, base = config().baseBranch) {
  return gh(`/repos/${config().owner}/${repo}/pulls`, {
    method: 'POST', body: JSON.stringify({ title, body: body || '', head, base })
  });
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export async function listCommitsForPath(repo, path, sha) {
  const params = new URLSearchParams();
  if (path) params.set('path', path);
  if (sha) params.set('sha', sha);
  params.set('per_page', '20');
  return gh(`/repos/${config().owner}/${repo}/commits?${params.toString()}`);
}

export async function deleteTextFile(repo, path, branch, message) {
  if (!branch) throw new Error('branch is required');
  if (branch === config().baseBranch && !config().allowDirectMain) throw new Error('Direct writes to the base branch are disabled');
  const current = await getTextFile(repo, path, branch);
  return gh(`/repos/${config().owner}/${repo}/contents/${encodePath(path)}`, {
    method: 'DELETE',
    body: JSON.stringify({ message: message || `Delete ${path}`, sha: current.sha, branch })
  });
}
