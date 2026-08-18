import { config } from './config.js';
import { FactoryError, validationError } from './errors.js';
import { logEvent } from './request-context.js';

const API = 'https://api.github.com';
const READ_TIMEOUT_MS = 10000;
const WRITE_TIMEOUT_MS = 20000;
const MAX_ATTEMPTS = 3;

function headers() {
  return {
    accept: 'application/vnd.github+json', authorization: `Bearer ${config().token}`,
    'x-github-api-version': '2026-03-10', 'content-type': 'application/json', 'user-agent': 'agent-skill-factory-web'
  };
}

async function gh(path, options = {}, meta = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const timeout = ['GET','HEAD'].includes(method) ? READ_TIMEOUT_MS : WRITE_TIMEOUT_MS;
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers(), ...(options.headers || {}) }, signal: AbortSignal.timeout(timeout) });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }
      const rateLimit = rateLimitFrom(res.headers);
      if (res.ok) return { data, meta: { githubStatus: res.status, githubRequestId: res.headers.get('x-github-request-id'), rateLimit } };
      const error = githubError(res, data, { ...meta, operation: meta.operation || method, rateLimit });
      if (!shouldRetryStatus(res.status) || attempt === MAX_ATTEMPTS) throw error;
      lastError = error;
      logEvent('github_retry', { attempt, method, githubStatus: res.status, operation: meta.operation || method, repo: meta.repo || null, ref: meta.ref || null, path: meta.path || null });
      await sleep(backoff(attempt));
    } catch (error) {
      if (error instanceof FactoryError) {
        if (!['RATE_LIMITED','UPSTREAM_5XX'].includes(error.code) || attempt === MAX_ATTEMPTS) throw error;
        lastError = error;
      } else {
        const timeoutLike = error?.name === 'TimeoutError' || error?.name === 'AbortError';
        const wrapped = new FactoryError(timeoutLike ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_5XX', timeoutLike ? 'GitHub request timed out' : 'GitHub network request failed', {
          status: timeoutLike ? 504 : 502, repo: meta.repo, ref: meta.ref, path: meta.path, operation: meta.operation || method, stage: meta.stage || 'github', cause: error
        });
        if (attempt === MAX_ATTEMPTS) throw wrapped;
        lastError = wrapped;
      }
      logEvent('github_retry', { attempt, method, errorCode: lastError?.code, operation: meta.operation || method, repo: meta.repo || null, ref: meta.ref || null, path: meta.path || null });
      await sleep(backoff(attempt));
    }
  }
  throw lastError || new FactoryError('INTERNAL_ERROR', 'GitHub request failed');
}

function githubError(res, data, meta) {
  const message = typeof data === 'object' && data?.message ? data.message : String(data || res.statusText);
  const base = { status: mapHttpStatus(res.status), githubStatus: res.status, githubRequestId: res.headers.get('x-github-request-id'), repo: meta.repo, ref: meta.ref, path: meta.path, operation: meta.operation, stage: meta.stage || 'github', rateLimit: meta.rateLimit };
  if (res.status === 401) return new FactoryError('AUTH_INVALID', 'GitHub authentication rejected', { ...base, status: 401 });
  if (res.status === 403) return new FactoryError('REPOSITORY_PERMISSION_DENIED', message, { ...base, status: 403 });
  if (res.status === 429 || (res.status === 403 && meta.rateLimit?.remaining === 0)) return new FactoryError('RATE_LIMITED', 'GitHub rate limit exceeded', { ...base, status: 429 });
  if (res.status >= 500) return new FactoryError('UPSTREAM_5XX', `GitHub upstream error: ${res.status}`, { ...base, status: 502 });
  if (res.status === 409 || res.status === 422) return new FactoryError('FILE_CONFLICT', message, { ...base, status: 409 });
  if (res.status === 404) return new FactoryError('FILE_NOT_FOUND', message, { ...base, status: 404 });
  return new FactoryError('INTERNAL_ERROR', `GitHub ${res.status}: ${message}`, base);
}

export async function getRepo(repo) {
  try { return (await gh(`/repos/${config().owner}/${repo}`, {}, { repo, operation: 'get_repo' })).data; }
  catch (e) { if (e.code === 'FILE_NOT_FOUND') throw new FactoryError('REPOSITORY_NOT_FOUND', 'Repository not found', { ...e.details, status: 404, repo, operation: 'get_repo' }); throw e; }
}
export async function getAuthenticatedUser() { return (await gh('/user', {}, { operation: 'authenticate_github' })).data; }
export async function getRateLimit() { const r = await gh('/rate_limit', {}, { operation: 'get_rate_limit' }); return { resources: r.data?.resources || null, rateLimit: r.meta.rateLimit }; }

export async function getContent(repo, path, ref) {
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : '';
  try { return (await gh(`/repos/${config().owner}/${repo}/contents/${encodePath(path)}${q}`, {}, { repo, ref, path, operation: 'get_content' })).data; }
  catch (e) {
    if (e.code !== 'FILE_NOT_FOUND') throw e;
    if (ref) {
      try { await assertRefExists(repo, ref); }
      catch (refError) { if (refError.code === 'REF_NOT_FOUND') throw refError; throw refError; }
    }
    throw new FactoryError('FILE_NOT_FOUND', `File not found: ${path}`, { ...e.details, status: 404, repo, ref, path, operation: 'get_content' });
  }
}
export async function getTextFile(repo, path, ref) {
  const data = await getContent(repo, path, ref);
  if (Array.isArray(data)) throw validationError(`${path} is a directory`, { repo, ref, path, operation: 'get_text_file' });
  if (!data.content) throw new FactoryError('FILE_NOT_FOUND', `No file content returned for ${path}`, { status: 404, repo, ref, path, operation: 'get_text_file' });
  return { text: Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8'), sha: data.sha, path: data.path };
}
export async function listDirectory(repo, path = '', ref) {
  const data = await getContent(repo, path, ref);
  if (!Array.isArray(data)) throw validationError(`${path || '/'} is not a directory`, { repo, ref, path, operation: 'list_directory' });
  return data.map(({ name, path, type, sha }) => ({ name, path, type, sha }));
}
export async function getBranch(repo, branch) {
  try { return (await gh(`/repos/${config().owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`, {}, { repo, ref: branch, operation: 'get_branch' })).data; }
  catch (e) { if (e.code === 'FILE_NOT_FOUND') throw new FactoryError('REF_NOT_FOUND', `Ref not found: ${branch}`, { ...e.details, status: 404, repo, ref: branch, operation: 'get_branch' }); throw e; }
}
export async function assertRefExists(repo, ref) {
  if (typeof ref !== 'string' || !ref.trim()) throw validationError('ref is required');
  try { await gh(`/repos/${config().owner}/${repo}/commits/${encodeURIComponent(ref)}`, {}, { repo, ref, operation: 'assert_ref' }); return true; }
  catch (e) { if (e.code === 'FILE_NOT_FOUND') throw new FactoryError('REF_NOT_FOUND', `Ref not found: ${ref}`, { ...e.details, status: 404, repo, ref, operation: 'assert_ref' }); throw e; }
}
export async function createBranch(repo, branch, baseBranch = config().baseBranch) {
  if (!/^[A-Za-z0-9._\/-]+$/.test(branch)) throw validationError('Invalid branch name');
  if (branch === config().baseBranch) throw validationError('Refusing to create/change the base branch as a change branch');
  const base = await getBranch(repo, baseBranch);
  try {
    const created = await gh(`/repos/${config().owner}/${repo}/git/refs`, { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }) }, { repo, ref: branch, operation: 'create_branch' });
    return { status: 'created', ...created.data };
  } catch (e) {
    if (e.code !== 'FILE_CONFLICT') throw e;
    const existing = await getBranch(repo, branch);
    return { status: 'already_exists', ref: existing.ref, object: existing.object, baseSha: base.object.sha };
  }
}
export async function deleteBranch(repo, branch) {
  if (!branch || branch === config().baseBranch) throw validationError('Refusing to delete base or empty branch');
  try { await gh(`/repos/${config().owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'DELETE' }, { repo, ref: branch, operation: 'delete_branch' }); return { status: 'deleted' }; }
  catch (e) { if (e.code === 'FILE_NOT_FOUND') return { status: 'already_deleted' }; throw e; }
}

export async function putTextFile(repo, path, content, branch, message, expectedSha = undefined) {
  if (!branch) throw validationError('branch is required');
  if (branch === config().baseBranch && !config().allowDirectMain) throw validationError('Direct writes to the base branch are disabled');
  let current = null;
  try { current = await getTextFile(repo, path, branch); } catch (e) { if (e.code !== 'FILE_NOT_FOUND') throw e; }
  if (current?.text === content) return { status: 'already_applied', content: { sha: current.sha }, commit: null };
  if (expectedSha === null && current) throw new FactoryError('FILE_CONFLICT', 'File already exists; expectedSha:null only permits creation', { status: 409, repo, ref: branch, path, operation: 'put_file' });
  if (typeof expectedSha === 'string' && current?.sha !== expectedSha) throw new FactoryError('STALE_SHA', 'Expected SHA does not match current file SHA', { status: 409, repo, ref: branch, path, operation: 'put_file' });
  if (typeof expectedSha === 'string' && !current) throw new FactoryError('STALE_SHA', 'Expected SHA supplied but file does not exist', { status: 409, repo, ref: branch, path, operation: 'put_file' });
  const sha = typeof expectedSha === 'string' ? expectedSha : current?.sha;
  try {
    const r = await gh(`/repos/${config().owner}/${repo}/contents/${encodePath(path)}`, { method: 'PUT', body: JSON.stringify({ message: message || `Update ${path}`, content: Buffer.from(content, 'utf8').toString('base64'), branch, ...(sha ? { sha } : {}) }) }, { repo, ref: branch, path, operation: 'put_file' });
    return { status: 'applied', ...r.data };
  } catch (e) {
    if (e.code === 'FILE_CONFLICT' && typeof expectedSha === 'string') throw new FactoryError('STALE_SHA', 'File changed before write completed', { ...e.details, status: 409, repo, ref: branch, path, operation: 'put_file' });
    throw e;
  }
}
export const putTextFileIfSha = (repo, path, content, branch, expectedSha, message) => putTextFile(repo, path, content, branch, message, expectedSha);
export async function compare(repo, base, head) { return (await gh(`/repos/${config().owner}/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`, {}, { repo, ref: head, operation: 'compare' })).data; }
export async function createPullRequest(repo, head, title, body, base = config().baseBranch) { return (await gh(`/repos/${config().owner}/${repo}/pulls`, { method: 'POST', body: JSON.stringify({ title, body: body || '', head, base }) }, { repo, ref: head, operation: 'create_pull_request' })).data; }
export async function listCommitsForPath(repo, path, sha) { const p = new URLSearchParams(); if (path) p.set('path', path); if (sha) p.set('sha', sha); p.set('per_page', '20'); return (await gh(`/repos/${config().owner}/${repo}/commits?${p}`, {}, { repo, ref: sha, path, operation: 'list_commits' })).data; }
export async function deleteTextFile(repo, path, branch, message) {
  if (!branch) throw validationError('branch is required');
  if (branch === config().baseBranch && !config().allowDirectMain) throw validationError('Direct writes to the base branch are disabled');
  const current = await getTextFile(repo, path, branch);
  const r = await gh(`/repos/${config().owner}/${repo}/contents/${encodePath(path)}`, { method: 'DELETE', body: JSON.stringify({ message: message || `Delete ${path}`, sha: current.sha, branch }) }, { repo, ref: branch, path, operation: 'delete_file' });
  return r.data;
}
function rateLimitFrom(headers) { const n = (k) => { const v = headers.get(k); return v === null ? null : Number(v); }; return { limit: n('x-ratelimit-limit'), remaining: n('x-ratelimit-remaining'), reset: n('x-ratelimit-reset'), used: n('x-ratelimit-used'), resource: headers.get('x-ratelimit-resource') }; }
function shouldRetryStatus(status) { return status === 429 || status >= 500; }
function mapHttpStatus(status) { if (status === 404) return 404; if ([401,403].includes(status)) return status; if ([409,422].includes(status)) return 409; if (status === 429) return 429; return status >= 500 ? 502 : 400; }
function backoff(attempt) { return Math.min(250 * (2 ** (attempt - 1)), 1000); }
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function encodePath(path) { return path.split('/').map(encodeURIComponent).join('/'); }
