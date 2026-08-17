import {
  requireAuth,
  json,
  errorResponse,
  readJson
} from '../lib/http.js';

import {
  config,
  repoForVisibility
} from '../lib/config.js';

import {
  createBranch,
  putTextFile,
  deleteTextFile,
  compare,
  createPullRequest,
  listCommitsForPath,
  getTextFile
} from '../lib/github.js';

import {
  getFactoryModule,
  listSkills,
  searchSkills,
  getSkill,
  getSkillFile,
  validateSkillText
} from '../lib/skills.js';

import {
  assertRegistryPath,
  listFlows,
  searchFlows,
  getFlow,
  listSuites,
  searchSuites,
  getSuite,
  findRegistryDependents,
  preflightRegistryDelete,
  validateFlowPackage,
  validateSuitePackage
} from '../lib/registry.js';

import { scanSecrets } from '../lib/security.js';

export default {
  async fetch(request) {
    try {
      requireAuth(request);
      const url = new URL(request.url);
      const route = url.pathname.replace(/^\/api\//, '').replace(/\/+$/, '');

      switch (route) {
        case 'factory-module': return handleFactoryModule(url);
        case 'factory-file': return handleFactoryFile(url);
        case 'skills': return handleSkills(url);
        case 'search-skills': return handleSearchSkills(url);
        case 'skill': return handleSkill(url);
        case 'skill-file': return handleSkillFile(url);
        case 'flows': return handleFlows(url);
        case 'search-flows': return handleSearchFlows(url);
        case 'flow': return handleFlow(url);
        case 'suites': return handleSuites(url);
        case 'search-suites': return handleSearchSuites(url);
        case 'suite': return handleSuite(url);
        case 'registry-dependents':
          if (request.method !== 'GET') throw new Error('GET required');
          return handleRegistryDependents(url);
        case 'skill-history':
        case 'registry-history': return handleRegistryHistory(url);
        case 'create-branch': return handleCreateBranch(request);
        case 'write-files': return handleWriteFiles(request);
        case 'delete-file': return handleDeleteFile(request);
        case 'validate-skill': return handleValidateSkill(request);
        case 'validate-flow': return handleValidateFlow(request);
        case 'validate-suite': return handleValidateSuite(request);
        case 'compare': return handleCompare(url);
        case 'pull-request': return handlePullRequest(request);
        default: return errorResponse(new Error(`Unknown API route: ${route}`), 404);
      }
    } catch (e) {
      return errorResponse(e, String(e.message).includes('Unauthorized') ? 401 : 400);
    }
  }
};

async function handleFactoryModule(url) {
  const name = url.searchParams.get('name');
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, ...(await getFactoryModule(name, ref)) });
}

async function handleFactoryFile(url) {
  let path = url.searchParams.get('path');
  const ref = url.searchParams.get('ref') || undefined;
  path = ({ 'api-router': 'api/[...route].js' })[path] || path;
  assertAllowedFactoryPath(path);
  const file = await getTextFile(config().factoryRepo, path, ref);
  return json({ ok: true, path: file.path, content: file.text, sha: file.sha, ref: ref || config().baseBranch });
}

async function handleSkills(url) {
  const visibility = url.searchParams.get('visibility');
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, visibility, skills: await listSkills(visibility, ref) });
}

async function handleSearchSkills(url) {
  const query = url.searchParams.get('query');
  const visibility = url.searchParams.get('visibility');
  const limit = url.searchParams.get('limit') || 5;
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, query, visibility, skills: await searchSkills(query, visibility, limit, ref) });
}

async function handleSkill(url) {
  const visibility = url.searchParams.get('visibility');
  const name = url.searchParams.get('name');
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, ...(await getSkill(visibility, name, ref)) });
}

async function handleSkillFile(url) {
  const visibility = url.searchParams.get('visibility');
  const name = url.searchParams.get('name');
  const path = url.searchParams.get('path');
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, ...(await getSkillFile(visibility, name, path, ref)) });
}

async function handleFlows(url) {
  const visibility = url.searchParams.get('visibility');
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, visibility, flows: await listFlows(visibility, ref) });
}

async function handleSearchFlows(url) {
  const query = url.searchParams.get('query');
  const visibility = url.searchParams.get('visibility');
  const limit = url.searchParams.get('limit') || 5;
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, query, visibility, flows: await searchFlows(query, visibility, limit, ref) });
}

async function handleFlow(url) {
  const visibility = url.searchParams.get('visibility');
  const name = url.searchParams.get('name');
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, ...(await getFlow(visibility, name, ref)) });
}

async function handleSuites(url) {
  const visibility = url.searchParams.get('visibility');
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, visibility, suites: await listSuites(visibility, ref) });
}

async function handleSearchSuites(url) {
  const query = url.searchParams.get('query');
  const visibility = url.searchParams.get('visibility');
  const limit = url.searchParams.get('limit') || 5;
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, query, visibility, suites: await searchSuites(query, visibility, limit, ref) });
}

async function handleSuite(url) {
  const visibility = url.searchParams.get('visibility');
  const name = url.searchParams.get('name');
  const ref = url.searchParams.get('ref') || undefined;
  return json({ ok: true, ...(await getSuite(visibility, name, ref)) });
}

async function handleRegistryDependents(url) {
  const targetType = url.searchParams.get('targetType');
  const targetName = url.searchParams.get('targetName');
  const targetVisibility = url.searchParams.get('targetVisibility');
  const dependentVisibility = url.searchParams.get('dependentVisibility');
  const ref = url.searchParams.get('ref');
  const dependents = await findRegistryDependents({ targetType, targetName, targetVisibility, dependentVisibility, ref });
  return json({
    ok: true,
    target: { type: targetType, name: targetName, visibility: targetVisibility },
    scan: { visibility: dependentVisibility, ref },
    dependents
  });
}

async function handleRegistryHistory(url) {
  const target = url.searchParams.get('target');
  const visibility = url.searchParams.get('visibility');
  const name = url.searchParams.get('name');
  if (!name) throw new Error('name is required');
  const normalizedTarget = target || 'skill';
  if (!['skill', 'flow', 'suite', 'factory'].includes(normalizedTarget)) throw new Error('target must be skill, flow, suite, or factory');
  const repo = normalizedTarget === 'factory' ? config().factoryRepo : repoForVisibility(visibility);
  const basePath = { skill: `skills/${name}`, flow: `flows/${name}`, suite: `suites/${name}`, factory: `factory/${name}` }[normalizedTarget];
  const commits = await listCommitsForPath(repo, basePath, url.searchParams.get('ref') || undefined);
  return json({ ok: true, commits: commits.map((c) => ({ sha: c.sha, message: c.commit?.message, date: c.commit?.author?.date, url: c.html_url })) });
}

async function handleCreateBranch(request) {
  requirePost(request);
  const body = await readJson(request);
  const repo = body.target === 'factory' ? config().factoryRepo : repoForVisibility(body.visibility);
  const branch = body.branch;
  await createBranch(repo, branch, body.base || config().baseBranch);
  return json({ ok: true, repository: `${config().owner}/${repo}`, branch });
}

async function handleWriteFiles(request) {
  requirePost(request);
  const body = await readJson(request);
  const repo = body.target === 'factory' ? config().factoryRepo : repoForVisibility(body.visibility);
  if (!body.branch) throw new Error('branch is required');
  if (!Array.isArray(body.files) || !body.files.length) throw new Error('files[] is required');
  const results = [];
  for (const file of body.files) {
    if (!file.path || typeof file.content !== 'string') throw new Error('Each file needs path and content');
    const pathSegments = file.path.split('/');
    if (pathSegments.includes('..') || file.path.startsWith('/') || file.path.includes('\\')) throw new Error(`Invalid path: ${file.path}`);
    if (body.target !== 'factory') assertRegistryPath(file.path, file.content);
    const sec = scanSecrets(file.content);
    if (!sec.ok) throw new Error(`Secret-like content detected in ${file.path}`);
    const result = await putTextFile(repo, file.path, file.content, body.branch, body.message || `Update ${file.path}`);
    results.push({ path: file.path, commit: result.commit?.sha, contentSha: result.content?.sha });
  }
  return json({ ok: true, repository: `${config().owner}/${repo}`, branch: body.branch, files: results });
}

async function handleDeleteFile(request) {
  requirePost(request);
  const body = await readJson(request);
  const repo = body.target === 'factory' ? config().factoryRepo : repoForVisibility(body.visibility);

  if (!body.path || body.path.includes('..') || body.path.startsWith('/')) throw new Error('Invalid path');

  if (body.target !== 'factory') {
    assertRegistryPath(body.path);
    const preflight = await preflightRegistryDelete({
      path: body.path,
      visibility: body.visibility,
      branch: body.branch,
      dependencyRefs: body.dependencyRefs || {}
    });
    if (preflight.guarded && !preflight.safe) {
      return json({ ok: false, ...preflight }, 409);
    }
  }

  const result = await deleteTextFile(repo, body.path, body.branch, body.message);
  return json({ ok: true, repository: `${config().owner}/${repo}`, path: body.path, commit: result.commit?.sha });
}

async function handleValidateSkill(request) {
  requirePost(request);
  const body = await readJson(request);
  const structure = validateSkillText(body.skillMd || '');
  const secrets = scanSecrets(body.skillMd || '');
  return json({ ok: structure.ok && secrets.ok, structure, secrets });
}

async function handleValidateFlow(request) {
  requirePost(request);
  const body = await readJson(request);
  const structure = await validateFlowPackage({ visibility: body.visibility, name: body.name, ref: body.ref, flowJson: body.flowJson });
  const secrets = scanSecrets(body.flowJson || '');
  return json({ ok: structure.ok && secrets.ok, structure, secrets });
}

async function handleValidateSuite(request) {
  requirePost(request);
  const body = await readJson(request);
  const structure = await validateSuitePackage({ visibility: body.visibility, name: body.name, ref: body.ref, suiteJson: body.suiteJson });
  const secrets = scanSecrets(body.suiteJson || '');
  return json({ ok: structure.ok && secrets.ok, structure, secrets });
}

async function handleCompare(url) {
  const target = url.searchParams.get('target');
  const visibility = url.searchParams.get('visibility');
  const head = url.searchParams.get('head');
  const base = url.searchParams.get('base') || config().baseBranch;
  if (!head) throw new Error('head is required');
  const repo = target === 'factory' ? config().factoryRepo : repoForVisibility(visibility);
  const diff = await compare(repo, base, head);
  return json({
    ok: true,
    repository: `${config().owner}/${repo}`,
    base,
    head,
    status: diff.status,
    aheadBy: diff.ahead_by,
    behindBy: diff.behind_by,
    totalCommits: diff.total_commits,
    files: (diff.files || []).map((f) => ({ filename: f.filename, status: f.status, additions: f.additions, deletions: f.deletions, patch: f.patch || null }))
  });
}

async function handlePullRequest(request) {
  requirePost(request);
  const body = await readJson(request);
  const repo = body.target === 'factory' ? config().factoryRepo : repoForVisibility(body.visibility);
  const pr = await createPullRequest(repo, body.head, body.title, body.body, body.base || config().baseBranch);
  return json({ ok: true, repository: `${config().owner}/${repo}`, number: pr.number, title: pr.title, url: pr.html_url });
}

function requirePost(request) {
  if (request.method !== 'POST') throw new Error('POST required');
}

function assertAllowedFactoryPath(path) {
  if (!path) throw new Error('path is required');
  const segments = path.split('/');
  if (segments.includes('..') || path.startsWith('/') || path.includes('\\')) throw new Error('Invalid factory path');
  const deniedRootFiles = new Set(['.env', '.env.local', '.env.production', '.env.development', '.env.test', 'credentials.json', 'secrets.json']);
  if (deniedRootFiles.has(path) || path.startsWith('.env.')) throw new Error('Reading secret files is not allowed');
  const allowedPrefixes = ['factory/', 'api/', 'lib/', 'gpt/', 'schemas/', 'templates/', 'evals/', 'docs/'];
  const allowedRootFiles = new Set(['README.md', 'package.json', 'vercel.json', '.env.example', '.gitignore']);
  const allowed = allowedRootFiles.has(path) || allowedPrefixes.some((prefix) => path.startsWith(prefix));
  if (!allowed) throw new Error('Path is outside the readable Factory source tree');
}
