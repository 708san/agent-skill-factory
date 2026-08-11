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

function assertSkillName(name) {
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(name || '')) throw new Error('Skill name must use lowercase letters, numbers, and hyphens');
}
