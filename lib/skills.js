import { config, repoForVisibility } from './config.js';
import { getTextFile, listDirectory } from './github.js';

export async function getFactoryModule(name, ref) {
  const allowed = new Set(['orchestrator', 'architect', 'author', 'reviewer', 'publisher']);
  if (!allowed.has(name)) throw new Error('Unknown factory module');
  const file = await getTextFile(config().factoryRepo, `factory/${name}/SKILL.md`, ref);
  return { name, content: file.text, sha: file.sha };
}

export async function listSkills(visibility, ref) {
  const repo = repoForVisibility(visibility);
  let items;
  try { items = await listDirectory(repo, 'skills', ref); }
  catch (e) {
    if (String(e.message).includes('GitHub 404')) return [];
    throw e;
  }
  return items.filter((x) => x.type === 'dir').map((x) => x.name).sort();
}

export async function searchSkills(query, visibility, limit = 5, ref) {
  if (typeof query !== 'string' || !query.trim()) throw new Error('query is required');

  const maxResults = normalizeSearchLimit(limit);
  const names = await listSkills(visibility, ref);
  const matches = [];

  for (const name of names) {
    let skill;
    try {
      skill = await getSkill(visibility, name, ref);
    } catch (e) {
      if (String(e.message).includes('GitHub 404')) continue;
      throw e;
    }

    const metadata = parseSkillMetadata(skill.content);
    const score = scoreSkill(query, name, metadata);
    if (score <= 0) continue;

    const result = { name, description: metadata.description || '', visibility };
    const optional = {};
    if (metadata.tags.length) optional.tags = metadata.tags;
    if (metadata.use_when.length) optional.use_when = metadata.use_when;
    if (metadata.do_not_use_when.length) optional.do_not_use_when = metadata.do_not_use_when;
    if (Object.keys(optional).length) result.metadata = optional;
    matches.push({ score, result });
  }

  return matches
    .sort((a, b) => b.score - a.score || a.result.name.localeCompare(b.result.name))
    .slice(0, maxResults)
    .map((x) => x.result);
}

export async function getSkill(visibility, name, ref) {
  assertSkillName(name);
  const repo = repoForVisibility(visibility);
  const file = await getTextFile(repo, `skills/${name}/SKILL.md`, ref);
  return { visibility, name, content: file.text, sha: file.sha };
}

export async function getSkillFile(visibility, name, path, ref) {
  assertSkillName(name);
  if (!path || path.includes('..') || path.startsWith('/')) throw new Error('Invalid relative path');
  const repo = repoForVisibility(visibility);
  const file = await getTextFile(repo, `skills/${name}/${path}`, ref);
  return { visibility, name, path, content: file.text, sha: file.sha };
}

export function validateSkillText(text) {
  const errors = [];
  const warnings = [];
  if (!text?.trim()) errors.push('SKILL.md is empty');
  if (!text.startsWith('---')) errors.push('Missing YAML frontmatter opening delimiter');
  if (!/\nname:\s*[^\n]+/i.test(text)) errors.push('Missing frontmatter name');
  if (!/\ndescription:\s*[^\n]+/i.test(text)) errors.push('Missing frontmatter description');
  if (!/^#\s+/m.test(text)) warnings.push('No H1 heading found');
  if (text.length > 40000) warnings.push('SKILL.md is very long; move detailed material into references');
  return { ok: errors.length === 0, errors, warnings };
}

function normalizeSearchLimit(limit) {
  const value = Number.parseInt(String(limit), 10);
  if (!Number.isFinite(value) || value < 1) return 5;
  return Math.min(value, 20);
}

function scoreSkill(query, name, metadata) {
  const q = normalizeText(query);
  const normalizedName = normalizeText(name.replace(/-/g, ' '));
  const description = normalizeText(metadata.description);
  const positiveMetadata = normalizeText([...metadata.tags, ...metadata.use_when].join(' '));
  const negativeMetadata = normalizeText(metadata.do_not_use_when.join(' '));

  let score = 0;
  if (q === normalizedName) score += 100;
  else if (normalizedName.includes(q)) score += 50;
  if (description.includes(q)) score += 30;

  for (const token of queryTokens(q)) {
    if (normalizedName.includes(token)) score += 12;
    if (description.includes(token)) score += 6;
    if (positiveMetadata.includes(token)) score += 3;
    if (negativeMetadata.includes(token)) score -= 4;
  }
  return score;
}

function queryTokens(value) {
  const unicodeTokens = value.match(/[\p{L}\p{N}]+/gu) || [];
  const latinTokens = value.match(/[a-z0-9]+/g) || [];
  return [...new Set([...unicodeTokens, ...latinTokens])].filter((token) => token.length > 1);
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function parseSkillMetadata(text) {
  const result = { description: '', tags: [], use_when: [], do_not_use_when: [] };
  const match = String(text || '').match(/^---\s*\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return result;

  const lines = match[1].split('\n');
  let activeListKey = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (activeListKey && line.startsWith('- ')) {
      result[activeListKey].push(stripYamlScalar(line.slice(2)));
      continue;
    }

    activeListKey = null;
    const separator = line.indexOf(':');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();

    if (key === 'description') {
      result.description = stripYamlScalar(rawValue);
      continue;
    }
    if (!['tags', 'use_when', 'do_not_use_when'].includes(key)) continue;
    if (!rawValue) {
      activeListKey = key;
      continue;
    }
    result[key] = parseMetadataValues(rawValue);
  }
  return result;
}

function parseMetadataValues(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((item) => stripYamlScalar(item)).filter(Boolean);
  }
  const scalar = stripYamlScalar(trimmed);
  return scalar ? [scalar] : [];
}

function stripYamlScalar(value) {
  const trimmed = String(value || '').trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function assertSkillName(name) {
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(name || '')) throw new Error('Skill name must use lowercase letters, numbers, and hyphens');
}
