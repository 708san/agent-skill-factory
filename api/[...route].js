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
  getSkill,
  getSkillFile,
  validateSkillText
} from '../lib/skills.js';

import { scanSecrets } from '../lib/security.js';


export default {
  async fetch(request) {
    try {
      requireAuth(request);

      const url = new URL(request.url);
      const route = url.pathname
        .replace(/^\/api\//, '')
        .replace(/\/+$/, '');

      switch (route) {
        case 'factory-module':
          return handleFactoryModule(url);

        case 'factory-file':
          return handleFactoryFile(url);

        case 'skills':
          return handleSkills(url);

        case 'skill':
          return handleSkill(url);

        case 'skill-file':
          return handleSkillFile(url);

        case 'skill-history':
          return handleSkillHistory(url);

        case 'create-branch':
          return handleCreateBranch(request);

        case 'write-files':
          return handleWriteFiles(request);

        case 'delete-file':
          return handleDeleteFile(request);

        case 'validate-skill':
          return handleValidateSkill(request);

        case 'compare':
          return handleCompare(url);

        case 'pull-request':
          return handlePullRequest(request);

        default:
          return errorResponse(
            new Error(`Unknown API route: ${route}`),
            404
          );
      }
    } catch (e) {
      return errorResponse(
        e,
        String(e.message).includes('Unauthorized') ? 401 : 400
      );
    }
  }
};


async function handleFactoryModule(url) {
  const name = url.searchParams.get('name');
  const ref = url.searchParams.get('ref') || undefined;

  return json({
    ok: true,
    ...(await getFactoryModule(name, ref))
  });
}



async function handleFactoryFile(url) {
  let path = url.searchParams.get('path');
  const ref = url.searchParams.get('ref') || undefined;

  const aliases = {
    'api-router': 'api/[...route].js'
  };

  path = aliases[path] || path;

  assertAllowedFactoryPath(path);

  const file = await getTextFile(
    config().factoryRepo,
    path,
    ref
  );

  return json({
    ok: true,
    path: file.path,
    content: file.text,
    sha: file.sha,
    ref: ref || config().baseBranch
  });
}


async function handleSkills(url) {
  const visibility = url.searchParams.get('visibility');
  const ref = url.searchParams.get('ref') || undefined;

  return json({
    ok: true,
    visibility,
    skills: await listSkills(visibility, ref)
  });
}


async function handleSkill(url) {
  const visibility = url.searchParams.get('visibility');
  const name = url.searchParams.get('name');
  const ref = url.searchParams.get('ref') || undefined;

  return json({
    ok: true,
    ...(await getSkill(visibility, name, ref))
  });
}


async function handleSkillFile(url) {
  const visibility = url.searchParams.get('visibility');
  const name = url.searchParams.get('name');
  const path = url.searchParams.get('path');
  const ref = url.searchParams.get('ref') || undefined;

  return json({
    ok: true,
    ...(await getSkillFile(
      visibility,
      name,
      path,
      ref
    ))
  });
}


async function handleSkillHistory(url) {
  const target = url.searchParams.get('target');
  const visibility = url.searchParams.get('visibility');
  const name = url.searchParams.get('name');

  if (!name) {
    throw new Error('name is required');
  }

  const repo =
    target === 'factory'
      ? config().factoryRepo
      : repoForVisibility(visibility);

  const basePath =
    target === 'factory'
      ? `factory/${name}`
      : `skills/${name}`;

  const commits = await listCommitsForPath(
    repo,
    basePath,
    url.searchParams.get('ref') || undefined
  );

  return json({
    ok: true,
    commits: commits.map((c) => ({
      sha: c.sha,
      message: c.commit?.message,
      date: c.commit?.author?.date,
      url: c.html_url
    }))
  });
}


async function handleCreateBranch(request) {
  requirePost(request);

  const body = await readJson(request);

  const repo =
    body.target === 'factory'
      ? config().factoryRepo
      : repoForVisibility(body.visibility);

  const branch = body.branch;

  await createBranch(
    repo,
    branch,
    body.base || config().baseBranch
  );

  return json({
    ok: true,
    repository: `${config().owner}/${repo}`,
    branch
  });
}


async function handleWriteFiles(request) {
  requirePost(request);

  const body = await readJson(request);

  const repo =
    body.target === 'factory'
      ? config().factoryRepo
      : repoForVisibility(body.visibility);

  if (!body.branch) {
    throw new Error('branch is required');
  }

  if (!Array.isArray(body.files) || !body.files.length) {
    throw new Error('files[] is required');
  }

  const results = [];

  for (const file of body.files) {
    if (
      !file.path ||
      typeof file.content !== 'string'
    ) {
      throw new Error(
        'Each file needs path and content'
      );
    }
    const pathSegments = file.path.split('/');
    if (
      pathSegments.includes('..') ||
      file.path.startsWith('/') ||
      file.path.includes('\\')
    ) {

      throw new Error(
        `Invalid path: ${file.path}`
      );
    }

    const sec = scanSecrets(file.content);

    if (!sec.ok) {
      throw new Error(
        `Secret-like content detected in ${file.path}`
      );
    }

    const result = await putTextFile(
      repo,
      file.path,
      file.content,
      body.branch,
      body.message || `Update ${file.path}`
    );

    results.push({
      path: file.path,
      commit: result.commit?.sha,
      contentSha: result.content?.sha
    });
  }

  return json({
    ok: true,
    repository: `${config().owner}/${repo}`,
    branch: body.branch,
    files: results
  });
}


async function handleDeleteFile(request) {
  requirePost(request);

  const body = await readJson(request);

  const repo =
    body.target === 'factory'
      ? config().factoryRepo
      : repoForVisibility(body.visibility);

  if (
    !body.path ||
    body.path.includes('..') ||
    body.path.startsWith('/')
  ) {
    throw new Error('Invalid path');
  }

  const result = await deleteTextFile(
    repo,
    body.path,
    body.branch,
    body.message
  );

  return json({
    ok: true,
    repository: `${config().owner}/${repo}`,
    path: body.path,
    commit: result.commit?.sha
  });
}


async function handleValidateSkill(request) {
  requirePost(request);

  const body = await readJson(request);

  const structure = validateSkillText(
    body.skillMd || ''
  );

  const secrets = scanSecrets(
    body.skillMd || ''
  );

  return json({
    ok: structure.ok && secrets.ok,
    structure,
    secrets
  });
}


async function handleCompare(url) {
  const target = url.searchParams.get('target');
  const visibility =
    url.searchParams.get('visibility');

  const head = url.searchParams.get('head');
  const base =
    url.searchParams.get('base') ||
    config().baseBranch;

  if (!head) {
    throw new Error('head is required');
  }

  const repo =
    target === 'factory'
      ? config().factoryRepo
      : repoForVisibility(visibility);

  const diff = await compare(
    repo,
    base,
    head
  );

  return json({
    ok: true,
    repository: `${config().owner}/${repo}`,
    base,
    head,
    status: diff.status,
    aheadBy: diff.ahead_by,
    behindBy: diff.behind_by,
    totalCommits: diff.total_commits,
    files: (diff.files || []).map((f) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      patch: f.patch || null
    }))
  });
}


async function handlePullRequest(request) {
  requirePost(request);

  const body = await readJson(request);

  const repo =
    body.target === 'factory'
      ? config().factoryRepo
      : repoForVisibility(body.visibility);

  const pr = await createPullRequest(
    repo,
    body.head,
    body.title,
    body.body,
    body.base || config().baseBranch
  );

  return json({
    ok: true,
    repository: `${config().owner}/${repo}`,
    number: pr.number,
    title: pr.title,
    url: pr.html_url
  });
}


function requirePost(request) {
  if (request.method !== 'POST') {
    throw new Error('POST required');
  }
}




  function assertAllowedFactoryPath(path) {
  if (!path) {
    throw new Error('path is required');
  }

  const segments = path.split('/');

  if (
    segments.includes('..') ||
    path.startsWith('/') ||
    path.includes('\\')
  ) {
    throw new Error('Invalid factory path');
  }

  const deniedRootFiles = new Set([
    '.env',
    '.env.local',
    '.env.production',
    '.env.development',
    '.env.test',
    'credentials.json',
    'secrets.json'
  ]);

  if (
    deniedRootFiles.has(path) ||
    path.startsWith('.env.')
  ) {
    throw new Error('Reading secret files is not allowed');
  }

  const allowedPrefixes = [
    'factory/',
    'api/',
    'lib/',
    'gpt/',
    'schemas/',
    'templates/',
    'evals/',
    'docs/'
  ];

  const allowedRootFiles = new Set([
    'README.md',
    'package.json',
    'vercel.json',
    '.env.example',
    '.gitignore'
  ]);

  const allowed =
    allowedRootFiles.has(path) ||
    allowedPrefixes.some((prefix) =>
      path.startsWith(prefix)
    );

  if (!allowed) {
    throw new Error(
      'Path is outside the readable Factory source tree'
    );
  }
}
