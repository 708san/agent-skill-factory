import { repoForVisibility } from './config.js';
import { getTextFile, listDirectory } from './github.js';
import { getSkill, searchSkills } from './skills.js';

const NAME_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
const ROOTS = new Set(['skills', 'flows', 'suites']);
const CONDITION_KEY_RE = /^[a-zA-Z0-9_.-]{1,80}$/;

export function assertRegistryPath(path, content) {
  if (typeof path !== 'string' || !path) throw new Error('Registry path is required');
  if (path.startsWith('/') || path.includes('\\')) throw new Error(`Invalid registry path: ${path}`);
  const segments = path.split('/');
  if (segments.includes('..') || segments.includes('.') || segments.some((segment) => !segment)) {
    throw new Error(`Invalid registry path: ${path}`);
  }
  if (segments.length < 3 || !ROOTS.has(segments[0])) {
    throw new Error(`Registry files must be under skills/<name>/, flows/<name>/, or suites/<name>/: ${path}`);
  }
  const [root, name] = segments;
  assertRegistryName(name);

  if (root === 'skills') return assertSkillPathCompat(segments, name, content);
  const manifest = root === 'flows' ? 'FLOW.json' : 'SUITE.json';
  if (segments.includes(manifest) && !(segments.length === 3 && segments[2] === manifest)) {
    throw new Error(`${manifest} must be at ${root}/${name}/${manifest}`);
  }
  if (segments.length === 3 && segments[2] === manifest && typeof content === 'string') {
    const parsed = parseJson(content, manifest);
    if (parsed.name !== name) throw new Error(`${manifest} name must match directory name: ${name}`);
  }
  return { type: root.slice(0, -1), name };
}

export async function listFlows(visibility, ref) {
  return listRegistryDirs('flows', visibility, ref);
}

export async function listSuites(visibility, ref) {
  return listRegistryDirs('suites', visibility, ref);
}

export async function getFlow(visibility, name, ref) {
  assertRegistryName(name);
  const file = await getTextFile(repoForVisibility(visibility), `flows/${name}/FLOW.json`, ref);
  const manifest = parseJson(file.text, 'FLOW.json');
  return { visibility, name, manifest, content: file.text, sha: file.sha };
}

export async function getSuite(visibility, name, ref) {
  assertRegistryName(name);
  const file = await getTextFile(repoForVisibility(visibility), `suites/${name}/SUITE.json`, ref);
  const manifest = parseJson(file.text, 'SUITE.json');
  return { visibility, name, manifest, content: file.text, sha: file.sha };
}

export async function searchFlows(query, visibility, limit = 5, ref) {
  return searchManifests(query, visibility, limit, ref, listFlows, getFlow);
}

export async function searchSuites(query, visibility, limit = 5, ref) {
  return searchManifests(query, visibility, limit, ref, listSuites, getSuite);
}

export async function validateFlowPackage({ visibility, name, ref, flowJson }) {
  assertRegistryName(name);
  let content = flowJson;
  if (typeof content !== 'string') {
    const loaded = await getFlow(visibility, name, ref);
    content = loaded.content;
  }
  const errors = [];
  const warnings = [];
  let flow;
  try { flow = parseJson(content, 'FLOW.json'); }
  catch (e) { return { ok: false, errors: [e.message], warnings }; }

  validateFlowShape(flow, name, errors, warnings);
  if (!errors.length) await validateFlowReferences(flow, visibility, ref, errors);
  return { ok: errors.length === 0, errors, warnings, manifest: flow };
}

export async function validateSuitePackage({ visibility, name, ref, suiteJson }) {
  assertRegistryName(name);
  let content = suiteJson;
  if (typeof content !== 'string') {
    const loaded = await getSuite(visibility, name, ref);
    content = loaded.content;
  }
  const errors = [];
  const warnings = [];
  let suite;
  try { suite = parseJson(content, 'SUITE.json'); }
  catch (e) { return { ok: false, errors: [e.message], warnings }; }

  validateSuiteShape(suite, name, errors);
  if (!errors.length) await validateSuiteReferences(suite, visibility, ref, errors);
  return { ok: errors.length === 0, errors, warnings, manifest: suite };
}

export function conditionMatches(condition, context = {}) {
  if (!condition) return true;
  const when = condition.when || {};
  return Object.entries(when).every(([key, expected]) => deepScalarEqual(readContext(context, key), expected));
}

export function assessFlowCompletion(flow, { context = {}, completedStepIds = [], excludedStepIds = [] } = {}) {
  const completed = new Set(completedStepIds);
  const excluded = new Set(excludedStepIds);
  const applicable = (flow.steps || []).filter((step) => conditionMatches(step.condition, context));
  const required = applicable.filter((step) => step.required !== false);
  const excludedRequired = required.filter((step) => excluded.has(step.id)).map((step) => step.id);
  const incompleteRequired = required.filter((step) => !completed.has(step.id)).map((step) => step.id);
  return {
    ok: excludedRequired.length === 0 && incompleteRequired.length === 0,
    requiredStepIds: required.map((step) => step.id),
    excludedRequired,
    incompleteRequired
  };
}

export async function resolveCapabilityStep(step, { visibility, ref, limit = 5 } = {}) {
  if (step?.type !== 'capability') throw new Error('Only capability steps may be dynamically resolved');
  const query = step.capability?.query;
  if (!query) throw new Error('Capability step query is required');
  return searchSkills(query, step.capability.visibility || visibility, limit, ref);
}

function validateFlowShape(flow, name, errors, warnings) {
  if (!isPlainObject(flow)) return errors.push('FLOW.json root must be an object');
  if (flow.schema_version !== 1) errors.push('schema_version must be 1');
  if (flow.name !== name) errors.push(`FLOW.json name must match directory name: ${name}`);
  if (flow.kind !== 'flow') errors.push('kind must be "flow"');
  validateMetadata(flow, errors);
  const inputs = stringArray(flow.inputs, 'inputs', errors, true);
  if (!Array.isArray(flow.steps) || !flow.steps.length) errors.push('steps must be a non-empty array');
  const stepIds = new Set();
  const steps = Array.isArray(flow.steps) ? flow.steps : [];

  for (const step of steps) {
    if (!isPlainObject(step)) { errors.push('Each step must be an object'); continue; }
    if (!validId(step.id)) errors.push(`Invalid step id: ${String(step.id)}`);
    else if (stepIds.has(step.id)) errors.push(`Duplicate step id: ${step.id}`);
    else stepIds.add(step.id);
    if (!['exact_skill', 'capability'].includes(step.type)) errors.push(`Invalid step type for ${step.id || '<unknown>'}`);
    if (typeof step.required !== 'boolean') errors.push(`Step ${step.id || '<unknown>'} required must be boolean`);
    if (!Array.isArray(step.depends_on)) errors.push(`Step ${step.id || '<unknown>'} depends_on must be an array`);
    else if (new Set(step.depends_on).size !== step.depends_on.length) errors.push(`Step ${step.id} has duplicate dependencies`);
    if (step.type === 'exact_skill') validateExactStep(step, errors);
    if (step.type === 'capability') validateCapabilityStep(step, errors);
    validateCondition(step.condition, `step ${step.id}`, errors);
    stringArray(step.expected_output, `step ${step.id} expected_output`, errors, true);
    validateHandoff(step.input_handoff, step, inputs, steps, errors);
  }

  for (const step of steps) {
    for (const dependency of step.depends_on || []) {
      if (!stepIds.has(dependency)) errors.push(`Step ${step.id} depends on nonexistent step: ${dependency}`);
      if (dependency === step.id) errors.push(`Step ${step.id} cannot depend on itself`);
    }
  }
  detectCycles(steps, errors);
  validateCompletion(flow.completion, steps, errors);
  if (flow.fallback_policy && flow.fallback_policy.exact_skill_substitution === true) {
    warnings.push('exact_skill_substitution is ignored in v1; exact Skill steps are never silently substituted');
  }
}

function validateExactStep(step, errors) {
  if (!isPlainObject(step.skill)) return errors.push(`Exact step ${step.id} requires skill object`);
  if (!NAME_RE.test(step.skill.name || '')) errors.push(`Exact step ${step.id} has invalid skill name`);
  if (step.skill.visibility && !['public', 'private'].includes(step.skill.visibility)) errors.push(`Exact step ${step.id} has invalid visibility`);
  if (step.capability !== undefined) errors.push(`Exact step ${step.id} must not define capability`);
}

function validateCapabilityStep(step, errors) {
  if (!isPlainObject(step.capability)) return errors.push(`Capability step ${step.id} requires capability object`);
  if (typeof step.capability.query !== 'string' || !step.capability.query.trim()) errors.push(`Capability step ${step.id} requires non-empty query`);
  if (step.capability.visibility && !['public', 'private'].includes(step.capability.visibility)) errors.push(`Capability step ${step.id} has invalid visibility`);
  if (step.skill !== undefined) errors.push(`Capability step ${step.id} must not pin a skill`);
  if (step.capability.compose !== undefined && typeof step.capability.compose !== 'boolean') errors.push(`Capability step ${step.id} compose must be boolean`);
}

function validateHandoff(handoff, step, flowInputs, steps, errors) {
  if (!isPlainObject(handoff)) return errors.push(`Step ${step.id} input_handoff must be an object`);
  const expected = new Set(step.expected_output || []);
  if (expected.size !== (step.expected_output || []).length) errors.push(`Step ${step.id} has duplicate expected outputs`);
  for (const [inputName, source] of Object.entries(handoff)) {
    if (!validId(inputName)) errors.push(`Step ${step.id} has invalid input handoff key: ${inputName}`);
    if (typeof source !== 'string') { errors.push(`Step ${step.id} handoff source for ${inputName} must be a string`); continue; }
    if (source.startsWith('flow.')) {
      const field = source.slice(5);
      if (!flowInputs.includes(field)) errors.push(`Step ${step.id} references undeclared flow input: ${field}`);
      continue;
    }
    const match = source.match(/^steps\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)$/);
    if (!match) { errors.push(`Step ${step.id} has invalid handoff source: ${source}`); continue; }
    const upstream = steps.find((candidate) => candidate.id === match[1]);
    if (!upstream) { errors.push(`Step ${step.id} handoff references nonexistent step: ${match[1]}`); continue; }
    if (!(step.depends_on || []).includes(upstream.id)) errors.push(`Step ${step.id} must depend_on handoff source step ${upstream.id}`);
    if (!(upstream.expected_output || []).includes(match[2])) errors.push(`Step ${step.id} references undeclared output ${match[2]} from ${upstream.id}`);
  }
}

function validateCompletion(completion, steps, errors) {
  if (!isPlainObject(completion)) return errors.push('completion must be an object');
  if (completion.required_steps !== 'all_required') errors.push('completion.required_steps must be "all_required" in v1');
  if (!isPlainObject(completion.outputs)) errors.push('completion.outputs must be an object');
  else {
    for (const [name, source] of Object.entries(completion.outputs)) {
      if (!validId(name)) errors.push(`Invalid completion output name: ${name}`);
      const match = typeof source === 'string' && source.match(/^steps\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)$/);
      if (!match) { errors.push(`Invalid completion output source for ${name}`); continue; }
      const step = steps.find((candidate) => candidate.id === match[1]);
      if (!step) errors.push(`Completion output ${name} references nonexistent step: ${match[1]}`);
      else if (!(step.expected_output || []).includes(match[2])) errors.push(`Completion output ${name} references undeclared output ${match[2]} from ${step.id}`);
    }
  }
  validateCondition(completion.condition, 'completion', errors);
}

function validateCondition(condition, label, errors) {
  if (condition === undefined) return;
  if (!isPlainObject(condition) || Object.keys(condition).length !== 1 || !isPlainObject(condition.when)) {
    errors.push(`${label} condition must be {"when": {...}}`); return;
  }
  for (const [key, value] of Object.entries(condition.when)) {
    if (!CONDITION_KEY_RE.test(key)) errors.push(`${label} condition has invalid key: ${key}`);
    if (!isConditionScalar(value)) errors.push(`${label} condition value for ${key} must be a scalar`);
  }
}

async function validateFlowReferences(flow, visibility, ref, errors) {
  for (const step of flow.steps || []) {
    if (step.type !== 'exact_skill') continue;
    const refVisibility = step.skill.visibility || visibility;
    if (visibility === 'public' && refVisibility !== 'public') {
      errors.push(`Public Flow cannot reference private Skill: ${step.skill.name}`); continue;
    }
    try { await getSkill(refVisibility, step.skill.name, ref); }
    catch (e) { errors.push(`Exact Skill reference not found or unreadable: ${refVisibility}/${step.skill.name}`); }
  }
  for (const step of flow.steps || []) {
    if (step.type === 'capability' && visibility === 'public' && step.capability.visibility === 'private') {
      errors.push(`Public Flow capability step cannot use private visibility: ${step.id}`);
    }
  }
}

function validateSuiteShape(suite, name, errors) {
  if (!isPlainObject(suite)) return errors.push('SUITE.json root must be an object');
  if (suite.schema_version !== 1) errors.push('schema_version must be 1');
  if (suite.name !== name) errors.push(`SUITE.json name must match directory name: ${name}`);
  if (suite.kind !== 'suite') errors.push('kind must be "suite"');
  validateMetadata(suite, errors);
  if (!isPlainObject(suite.members)) return errors.push('members must be an object');
  const skills = Array.isArray(suite.members.skills) ? suite.members.skills : [];
  const flows = Array.isArray(suite.members.flows) ? suite.members.flows : [];
  if (!Array.isArray(suite.members.skills)) errors.push('members.skills must be an array');
  if (!Array.isArray(suite.members.flows)) errors.push('members.flows must be an array');
  validateMemberRefs(skills, 'Skill', errors);
  validateMemberRefs(flows, 'Flow', errors);
  if (suite.policies !== undefined && !isPlainObject(suite.policies)) errors.push('policies must be an object when present');
  if (suite.quality_gates !== undefined && !Array.isArray(suite.quality_gates)) errors.push('quality_gates must be an array when present');
  if (suite.artifact_contracts !== undefined && !Array.isArray(suite.artifact_contracts)) errors.push('artifact_contracts must be an array when present');
}

function validateMemberRefs(items, label, errors) {
  const seen = new Set();
  for (const item of items) {
    if (!isPlainObject(item) || !NAME_RE.test(item.name || '')) { errors.push(`Invalid ${label} member reference`); continue; }
    if (item.visibility && !['public', 'private'].includes(item.visibility)) errors.push(`${label} member ${item.name} has invalid visibility`);
    const key = `${item.visibility || 'same'}:${item.name}`;
    if (seen.has(key)) errors.push(`Duplicate ${label} member: ${key}`);
    seen.add(key);
  }
}

async function validateSuiteReferences(suite, visibility, ref, errors) {
  for (const item of suite.members.skills || []) {
    const refVisibility = item.visibility || visibility;
    if (visibility === 'public' && refVisibility !== 'public') { errors.push(`Public Suite cannot reference private Skill: ${item.name}`); continue; }
    try { await getSkill(refVisibility, item.name, ref); }
    catch (e) { errors.push(`Skill member not found or unreadable: ${refVisibility}/${item.name}`); }
  }
  for (const item of suite.members.flows || []) {
    const refVisibility = item.visibility || visibility;
    if (visibility === 'public' && refVisibility !== 'public') { errors.push(`Public Suite cannot reference private Flow: ${item.name}`); continue; }
    try { await getFlow(refVisibility, item.name, ref); }
    catch (e) { errors.push(`Flow member not found or unreadable: ${refVisibility}/${item.name}`); }
  }
}

function validateMetadata(manifest, errors) {
  if (manifest.description !== undefined && typeof manifest.description !== 'string') errors.push('description must be a string');
  if (manifest.tags !== undefined) stringArray(manifest.tags, 'tags', errors, true);
}

function detectCycles(steps, errors) {
  const graph = new Map(steps.map((step) => [step.id, step.depends_on || []]));
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) { errors.push(`Dependency cycle detected at step: ${id}`); return; }
    if (visited.has(id) || !graph.has(id)) return;
    visiting.add(id);
    for (const dep of graph.get(id)) visit(dep);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of graph.keys()) visit(id);
}

async function searchManifests(query, visibility, limit, ref, listFn, getFn) {
  if (typeof query !== 'string' || !query.trim()) throw new Error('query is required');
  const names = await listFn(visibility, ref);
  const q = normalize(query);
  const matches = [];
  for (const name of names) {
    let item;
    try { item = await getFn(visibility, name, ref); }
    catch (e) { if (String(e.message).includes('GitHub 404')) continue; throw e; }
    const manifest = item.manifest || {};
    const haystack = normalize([name.replace(/-/g, ' '), manifest.description, ...(manifest.tags || []), ...(manifest.use_when || [])].join(' '));
    let score = q === normalize(name.replace(/-/g, ' ')) ? 100 : 0;
    if (haystack.includes(q)) score += 40;
    for (const token of q.match(/[\p{L}\p{N}]+/gu) || []) if (token.length > 1 && haystack.includes(token)) score += 5;
    if (score > 0) matches.push({ score, result: { name, description: manifest.description || '', tags: manifest.tags || [], visibility } });
  }
  const max = Math.min(Math.max(Number.parseInt(String(limit), 10) || 5, 1), 20);
  return matches.sort((a, b) => b.score - a.score || a.result.name.localeCompare(b.result.name)).slice(0, max).map((x) => x.result);
}

async function listRegistryDirs(root, visibility, ref) {
  const repo = repoForVisibility(visibility);
  let items;
  try { items = await listDirectory(repo, root, ref); }
  catch (e) { if (String(e.message).includes('GitHub 404')) return []; throw e; }
  return items.filter((x) => x.type === 'dir').map((x) => x.name).sort();
}

function assertSkillPathCompat(segments, name, content) {
  if (segments.includes('SKILL.md') && !(segments.length === 3 && segments[2] === 'SKILL.md')) {
    throw new Error(`SKILL.md must be at skills/${name}/SKILL.md`);
  }
  if (segments.length === 3 && segments[2] === 'SKILL.md' && typeof content === 'string') {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---(?:\n|$)/);
    if (match) {
      const nameLine = match[1].split('\n').find((line) => line.trim().startsWith('name:'));
      const declared = nameLine ? nameLine.split(':').slice(1).join(':').trim().replace(/^['"]|['"]$/g, '') : '';
      if (declared && declared !== name) throw new Error(`Skill frontmatter name must match directory name: ${name}`);
    }
  }
  return { type: 'skill', name, skillName: name };
}

function parseJson(text, label) {
  try { return JSON.parse(text); }
  catch (e) { throw new Error(`${label} must contain valid JSON: ${e.message}`); }
}

function assertRegistryName(name) {
  if (!NAME_RE.test(name || '')) throw new Error('Registry object name must use lowercase letters, numbers, and hyphens');
}

function stringArray(value, label, errors, optional = false) {
  if (value === undefined && optional) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    errors.push(`${label} must be an array of non-empty strings`); return [];
  }
  if (new Set(value).size !== value.length) errors.push(`${label} must not contain duplicates`);
  return value;
}

function validId(value) { return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(value); }
function isPlainObject(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function isConditionScalar(value) { return value === null || ['string', 'number', 'boolean'].includes(typeof value); }
function normalize(value) { return String(value || '').toLowerCase().trim(); }
function readContext(context, key) { return key.split('.').reduce((value, part) => (isPlainObject(value) ? value[part] : undefined), context); }
function deepScalarEqual(actual, expected) { return Object.is(actual, expected); }
