import { repoForVisibility } from './config.js';
import { getTextFile, listDirectory } from './github.js';
import { getSkill, searchSkills, assertSkillRegistryPath } from './skills.js';

const NAME_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
const ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;
const CONDITION_KEY_RE = /^[a-zA-Z0-9_.-]{1,80}$/;
const ROOTS = new Set(['skills', 'flows', 'suites']);
const TARGET_TYPES = new Set(['skill', 'flow']);
const VISIBILITIES = new Set(['public', 'private']);

export function assertRegistryPath(path, content) {
  if (typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\')) throw new Error(`Invalid registry path: ${path || ''}`);
  const segments = path.split('/');
  if (segments.includes('..') || segments.includes('.') || segments.some((x) => !x)) throw new Error(`Invalid registry path: ${path}`);
  if (segments.length < 3 || !ROOTS.has(segments[0])) throw new Error(`Registry files must be under skills/<name>/, flows/<name>/, or suites/<name>/: ${path}`);
  const [root, name] = segments;
  if (root === 'skills') return assertSkillRegistryPath(path, content);
  assertName(name);
  const manifestName = root === 'flows' ? 'FLOW.json' : 'SUITE.json';
  if (segments.includes(manifestName) && !(segments.length === 3 && segments[2] === manifestName)) throw new Error(`${manifestName} must be at ${root}/${name}/${manifestName}`);
  if (segments.length === 3 && segments[2] === manifestName && typeof content === 'string') {
    const manifest = parseJson(content, manifestName);
    if (manifest.name !== name) throw new Error(`${manifestName} name must match directory name: ${name}`);
  }
  return { type: root.slice(0, -1), name };
}

export const listFlows = (visibility, ref) => listDirs('flows', visibility, ref);
export const listSuites = (visibility, ref) => listDirs('suites', visibility, ref);

export async function getFlow(visibility, name, ref) {
  assertName(name);
  const file = await getTextFile(repoForVisibility(visibility), `flows/${name}/FLOW.json`, ref);
  return { visibility, name, manifest: parseJson(file.text, 'FLOW.json'), content: file.text, sha: file.sha };
}

export async function getSuite(visibility, name, ref) {
  assertName(name);
  const file = await getTextFile(repoForVisibility(visibility), `suites/${name}/SUITE.json`, ref);
  return { visibility, name, manifest: parseJson(file.text, 'SUITE.json'), content: file.text, sha: file.sha };
}

export const searchFlows = (query, visibility, limit = 5, ref) => searchObjects(query, visibility, limit, ref, listFlows, getFlow);
export const searchSuites = (query, visibility, limit = 5, ref) => searchObjects(query, visibility, limit, ref, listSuites, getSuite);

export async function findRegistryDependents({
  targetType,
  targetName,
  targetVisibility,
  dependentVisibility,
  ref
}) {
  assertTargetType(targetType);
  assertName(targetName);
  assertVisibility(targetVisibility, 'targetVisibility');
  assertVisibility(dependentVisibility, 'dependentVisibility');
  if (typeof ref !== 'string' || !ref.trim()) throw new Error('ref is required for a dependency scan');

  const target = {
    type: targetType,
    name: targetName,
    visibility: targetVisibility
  };
  const dependents = [];

  if (targetType === 'skill') {
    for (const flowName of await listFlows(dependentVisibility, ref)) {
      const flow = await getFlow(dependentVisibility, flowName, ref);
      const steps = Array.isArray(flow.manifest?.steps) ? flow.manifest.steps : [];

      steps.forEach((step, stepIndex) => {
        if (step?.type !== 'exact_skill' || !isObject(step.skill)) return;
        pushReferenceIfMatch(dependents, {
          target,
          ownerVisibility: dependentVisibility,
          reference: step.skill,
          dependentType: 'flow',
          dependentName: flowName,
          manifestPath: `flows/${flowName}/FLOW.json`,
          referenceKind: 'exact_skill',
          referenceLocation: {
            step_id: typeof step.id === 'string' ? step.id : null,
            step_index: stepIndex
          }
        });
      });
    }
  }

  for (const suiteName of await listSuites(dependentVisibility, ref)) {
    const suite = await getSuite(dependentVisibility, suiteName, ref);
    const memberKey = targetType === 'skill' ? 'skills' : 'flows';
    const members = Array.isArray(suite.manifest?.members?.[memberKey])
      ? suite.manifest.members[memberKey]
      : [];

    members.forEach((member, memberIndex) => {
      if (!isObject(member)) return;
      pushReferenceIfMatch(dependents, {
        target,
        ownerVisibility: dependentVisibility,
        reference: member,
        dependentType: 'suite',
        dependentName: suiteName,
        manifestPath: `suites/${suiteName}/SUITE.json`,
        referenceKind: targetType === 'skill' ? 'suite_skill_member' : 'suite_flow_member',
        referenceLocation: { member_index: memberIndex }
      });
    });
  }

  return dependents;
}

export async function validateFlowPackage({ visibility, name, ref, flowJson }) {
  assertName(name);
  const content = typeof flowJson === 'string' ? flowJson : (await getFlow(visibility, name, ref)).content;
  const errors = [];
  const warnings = [];
  let flow;
  try { flow = parseJson(content, 'FLOW.json'); } catch (e) { return { ok: false, errors: [e.message], warnings }; }
  validateFlowShape(flow, name, errors, warnings);
  if (!errors.length) await validateFlowRefs(flow, visibility, ref, errors);
  return { ok: errors.length === 0, errors, warnings, manifest: flow };
}

export async function validateSuitePackage({ visibility, name, ref, suiteJson }) {
  assertName(name);
  const content = typeof suiteJson === 'string' ? suiteJson : (await getSuite(visibility, name, ref)).content;
  const errors = [];
  const warnings = [];
  let suite;
  try { suite = parseJson(content, 'SUITE.json'); } catch (e) { return { ok: false, errors: [e.message], warnings }; }
  validateSuiteShape(suite, name, visibility, errors);
  if (!errors.length) await validateSuiteRefs(suite, visibility, ref, errors);
  return { ok: errors.length === 0, errors, warnings, manifest: suite };
}

export function conditionMatches(condition, context = {}) {
  if (!condition) return true;
  return Object.entries(condition.when || {}).every(([key, expected]) => Object.is(readPath(context, key), expected));
}

export function assessFlowCompletion(flow, { context = {}, completedStepIds = [], excludedStepIds = [] } = {}) {
  const completed = new Set(completedStepIds);
  const excluded = new Set(excludedStepIds);
  const required = (flow.steps || []).filter((s) => s.required !== false && conditionMatches(s.condition, context));
  const excludedRequired = required.filter((s) => excluded.has(s.id)).map((s) => s.id);
  const incompleteRequired = required.filter((s) => !completed.has(s.id)).map((s) => s.id);
  return { ok: excludedRequired.length === 0 && incompleteRequired.length === 0, requiredStepIds: required.map((s) => s.id), excludedRequired, incompleteRequired };
}

export async function resolveCapabilityStep(step, { visibility, ref, limit = 5 } = {}) {
  if (step?.type !== 'capability') throw new Error('Only capability steps may be dynamically resolved');
  const query = step.capability?.query;
  if (typeof query !== 'string' || !query.trim()) throw new Error('Capability step query is required');
  return searchSkills(query, step.capability.visibility || visibility, limit, ref);
}

function pushReferenceIfMatch(dependents, {
  target,
  ownerVisibility,
  reference,
  dependentType,
  dependentName,
  manifestPath,
  referenceKind,
  referenceLocation
}) {
  const effectiveVisibility = reference.visibility || ownerVisibility;
  if (reference.name !== target.name || effectiveVisibility !== target.visibility) return;
  const hasExplicitVisibility = Object.prototype.hasOwnProperty.call(reference, 'visibility');

  dependents.push({
    dependent_type: dependentType,
    dependent_name: dependentName,
    dependent_visibility: ownerVisibility,
    manifest_path: manifestPath,
    reference_kind: referenceKind,
    reference_location: referenceLocation,
    referenced_name: reference.name,
    has_explicit_visibility: hasExplicitVisibility,
    explicit_visibility: hasExplicitVisibility ? reference.visibility : null,
    effective_visibility: effectiveVisibility
  });
}

function validateFlowShape(flow, name, errors, warnings) {
  if (!isObject(flow)) return errors.push('FLOW.json root must be an object');
  if (flow.schema_version !== 1) errors.push('schema_version must be 1');
  if (flow.kind !== 'flow') errors.push('kind must be "flow"');
  if (flow.name !== name) errors.push(`FLOW.json name must match directory name: ${name}`);
  validateMetadata(flow, errors);
  const flowInputs = validateStrings(flow.inputs, 'inputs', errors, true);
  if (!Array.isArray(flow.steps) || !flow.steps.length) errors.push('steps must be a non-empty array');
  const steps = Array.isArray(flow.steps) ? flow.steps : [];
  const ids = new Set();

  for (const step of steps) {
    if (!isObject(step)) { errors.push('Each step must be an object'); continue; }
    if (!ID_RE.test(step.id || '')) errors.push(`Invalid step id: ${String(step.id)}`);
    else if (ids.has(step.id)) errors.push(`Duplicate step id: ${step.id}`);
    else ids.add(step.id);
    if (!['exact_skill', 'capability'].includes(step.type)) errors.push(`Invalid step type for ${step.id || '<unknown>'}`);
    if (typeof step.required !== 'boolean') errors.push(`Step ${step.id || '<unknown>'} required must be boolean`);
    if (!Array.isArray(step.depends_on)) errors.push(`Step ${step.id || '<unknown>'} depends_on must be an array`);
    else if (new Set(step.depends_on).size !== step.depends_on.length) errors.push(`Step ${step.id} has duplicate dependencies`);
    if (step.type === 'exact_skill') validateExact(step, errors);
    if (step.type === 'capability') validateCapability(step, errors);
    validateCondition(step.condition, `step ${step.id}`, errors);
    validateStrings(step.expected_output, `step ${step.id} expected_output`, errors, false);
    validateHandoff(step, flowInputs, steps, errors);
  }

  for (const step of steps) for (const dep of step.depends_on || []) {
    if (!ids.has(dep)) errors.push(`Step ${step.id} depends on nonexistent step: ${dep}`);
    if (dep === step.id) errors.push(`Step ${step.id} cannot depend on itself`);
  }
  detectCycles(steps, errors);
  validateCompletion(flow.completion, steps, errors);
  if (flow.fallback_policy?.exact_skill_substitution === true) warnings.push('exact_skill_substitution is ignored in v1; exact Skill steps are never silently substituted');
}

function validateExact(step, errors) {
  if (!isObject(step.skill)) return errors.push(`Exact step ${step.id} requires skill object`);
  if (!NAME_RE.test(step.skill.name || '')) errors.push(`Exact step ${step.id} has invalid skill name`);
  if (step.skill.visibility && !['public', 'private'].includes(step.skill.visibility)) errors.push(`Exact step ${step.id} has invalid visibility`);
  if (step.capability !== undefined) errors.push(`Exact step ${step.id} must not define capability`);
}

function validateCapability(step, errors) {
  if (!isObject(step.capability)) return errors.push(`Capability step ${step.id} requires capability object`);
  if (typeof step.capability.query !== 'string' || !step.capability.query.trim()) errors.push(`Capability step ${step.id} requires non-empty query`);
  if (step.capability.visibility && !['public', 'private'].includes(step.capability.visibility)) errors.push(`Capability step ${step.id} has invalid visibility`);
  if (step.capability.compose !== undefined && typeof step.capability.compose !== 'boolean') errors.push(`Capability step ${step.id} compose must be boolean`);
  if (step.skill !== undefined) errors.push(`Capability step ${step.id} must not pin a skill`);
}

function validateHandoff(step, flowInputs, steps, errors) {
  if (!isObject(step.input_handoff)) return errors.push(`Step ${step.id} input_handoff must be an object`);
  for (const [inputName, source] of Object.entries(step.input_handoff)) {
    if (!ID_RE.test(inputName)) errors.push(`Step ${step.id} has invalid input handoff key: ${inputName}`);
    if (typeof source !== 'string') { errors.push(`Step ${step.id} handoff source for ${inputName} must be a string`); continue; }
    if (source.startsWith('flow.')) {
      const field = source.slice(5);
      if (!flowInputs.includes(field)) errors.push(`Step ${step.id} references undeclared flow input: ${field}`);
      continue;
    }
    const match = source.match(/^steps\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)$/);
    if (!match) { errors.push(`Step ${step.id} has invalid handoff source: ${source}`); continue; }
    const upstream = steps.find((s) => s.id === match[1]);
    if (!upstream) { errors.push(`Step ${step.id} handoff references nonexistent step: ${match[1]}`); continue; }
    if (!(step.depends_on || []).includes(upstream.id)) errors.push(`Step ${step.id} must depend_on handoff source step ${upstream.id}`);
    if (!(upstream.expected_output || []).includes(match[2])) errors.push(`Step ${step.id} references undeclared output ${match[2]} from ${upstream.id}`);
  }
}

function validateCompletion(completion, steps, errors) {
  if (!isObject(completion)) return errors.push('completion must be an object');
  if (completion.required_steps !== 'all_required') errors.push('completion.required_steps must be "all_required" in v1');
  if (!isObject(completion.outputs)) errors.push('completion.outputs must be an object');
  else for (const [name, source] of Object.entries(completion.outputs)) {
    if (!ID_RE.test(name)) errors.push(`Invalid completion output name: ${name}`);
    const match = typeof source === 'string' && source.match(/^steps\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)$/);
    if (!match) { errors.push(`Invalid completion output source for ${name}`); continue; }
    const step = steps.find((s) => s.id === match[1]);
    if (!step) errors.push(`Completion output ${name} references nonexistent step: ${match[1]}`);
    else if (!(step.expected_output || []).includes(match[2])) errors.push(`Completion output ${name} references undeclared output ${match[2]} from ${step.id}`);
  }
  validateCondition(completion.condition, 'completion', errors);
}

function validateCondition(condition, label, errors) {
  if (condition === undefined) return;
  if (!isObject(condition) || Object.keys(condition).length !== 1 || !isObject(condition.when)) return errors.push(`${label} condition must be {"when": {...}}`);
  for (const [key, value] of Object.entries(condition.when)) {
    if (!CONDITION_KEY_RE.test(key)) errors.push(`${label} condition has invalid key: ${key}`);
    if (!(value === null || ['string', 'number', 'boolean'].includes(typeof value))) errors.push(`${label} condition value for ${key} must be a scalar`);
  }
}

async function validateFlowRefs(flow, visibility, ref, errors) {
  for (const step of flow.steps || []) {
    if (step.type === 'capability') {
      if (visibility === 'public' && step.capability.visibility === 'private') errors.push(`Public Flow capability step cannot use private visibility: ${step.id}`);
      continue;
    }
    if (step.type !== 'exact_skill') continue;
    const v = step.skill.visibility || visibility;
    if (visibility === 'public' && v !== 'public') { errors.push(`Public Flow cannot reference private Skill: ${step.skill.name}`); continue; }
    try { await getSkill(v, step.skill.name, ref); } catch { errors.push(`Exact Skill reference not found or unreadable: ${v}/${step.skill.name}`); }
  }
}

function validateSuiteShape(suite, name, visibility, errors) {
  if (!isObject(suite)) return errors.push('SUITE.json root must be an object');
  if (suite.schema_version !== 1) errors.push('schema_version must be 1');
  if (suite.kind !== 'suite') errors.push('kind must be "suite"');
  if (suite.name !== name) errors.push(`SUITE.json name must match directory name: ${name}`);
  validateMetadata(suite, errors);
  if (!isObject(suite.members)) return errors.push('members must be an object');
  if (!Array.isArray(suite.members.skills)) errors.push('members.skills must be an array');
  if (!Array.isArray(suite.members.flows)) errors.push('members.flows must be an array');
  validateMembers(Array.isArray(suite.members.skills) ? suite.members.skills : [], 'Skill', visibility, errors);
  validateMembers(Array.isArray(suite.members.flows) ? suite.members.flows : [], 'Flow', visibility, errors);
  if (suite.policies !== undefined && !isObject(suite.policies)) errors.push('policies must be an object when present');
  if (suite.quality_gates !== undefined && !Array.isArray(suite.quality_gates)) errors.push('quality_gates must be an array when present');
  if (suite.artifact_contracts !== undefined && !Array.isArray(suite.artifact_contracts)) errors.push('artifact_contracts must be an array when present');
}

function validateMembers(items, label, ownerVisibility, errors) {
  const seen = new Set();
  for (const item of items) {
    if (!isObject(item) || !NAME_RE.test(item.name || '')) { errors.push(`Invalid ${label} member reference`); continue; }
    if (item.visibility && !['public', 'private'].includes(item.visibility)) errors.push(`${label} member ${item.name} has invalid visibility`);
    const effectiveVisibility = item.visibility || ownerVisibility;
    const key = `${effectiveVisibility}:${item.name}`;
    if (seen.has(key)) errors.push(`Duplicate ${label} member: ${key}`);
    seen.add(key);
  }
}

async function validateSuiteRefs(suite, visibility, ref, errors) {
  for (const item of suite.members.skills || []) await validateMemberRef(item, 'Skill', visibility, ref, errors, getSkill);
  for (const item of suite.members.flows || []) await validateMemberRef(item, 'Flow', visibility, ref, errors, getFlow);
}

async function validateMemberRef(item, label, ownerVisibility, ref, errors, getter) {
  const v = item.visibility || ownerVisibility;
  if (ownerVisibility === 'public' && v !== 'public') return errors.push(`Public Suite cannot reference private ${label}: ${item.name}`);
  try { await getter(v, item.name, ref); } catch { errors.push(`${label} member not found or unreadable: ${v}/${item.name}`); }
}

function detectCycles(steps, errors) {
  const graph = new Map(steps.map((s) => [s.id, s.depends_on || []]));
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) { errors.push(`Dependency cycle detected at step: ${id}`); return; }
    if (visited.has(id) || !graph.has(id)) return;
    visiting.add(id);
    for (const dep of graph.get(id)) visit(dep);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of graph.keys()) visit(id);
}

async function searchObjects(query, visibility, limit, ref, listFn, getFn) {
  if (typeof query !== 'string' || !query.trim()) throw new Error('query is required');
  const q = normalize(query);
  const matches = [];
  for (const name of await listFn(visibility, ref)) {
    let object;
    try { object = await getFn(visibility, name, ref); } catch (e) { if (String(e.message).includes('GitHub 404')) continue; throw e; }
    const m = object.manifest || {};
    const haystack = normalize([name.replace(/-/g, ' '), m.description, ...(m.tags || []), ...(m.use_when || [])].join(' '));
    let score = q === normalize(name.replace(/-/g, ' ')) ? 100 : 0;
    if (haystack.includes(q)) score += 40;
    for (const token of q.match(/[\p{L}\p{N}]+/gu) || []) if (token.length > 1 && haystack.includes(token)) score += 5;
    if (score > 0) matches.push({ score, result: { name, description: m.description || '', tags: m.tags || [], visibility } });
  }
  const max = Math.min(Math.max(Number.parseInt(String(limit), 10) || 5, 1), 20);
  return matches.sort((a, b) => b.score - a.score || a.result.name.localeCompare(b.result.name)).slice(0, max).map((x) => x.result);
}

async function listDirs(root, visibility, ref) {
  let items;
  try { items = await listDirectory(repoForVisibility(visibility), root, ref); }
  catch (e) { if (String(e.message).includes('GitHub 404')) return []; throw e; }
  return items.filter((x) => x.type === 'dir').map((x) => x.name).sort();
}

function validateMetadata(manifest, errors) {
  if (manifest.description !== undefined && typeof manifest.description !== 'string') errors.push('description must be a string');
  if (manifest.tags !== undefined) validateStrings(manifest.tags, 'tags', errors, false);
}

function validateStrings(value, label, errors, optional) {
  if (value === undefined && optional) return [];
  if (!Array.isArray(value) || value.some((x) => typeof x !== 'string' || !x.trim())) { errors.push(`${label} must be an array of non-empty strings`); return []; }
  if (new Set(value).size !== value.length) errors.push(`${label} must not contain duplicates`);
  return value;
}

function parseJson(text, label) { try { return JSON.parse(text); } catch (e) { throw new Error(`${label} must contain valid JSON: ${e.message}`); } }
function assertName(name) { if (!NAME_RE.test(name || '')) throw new Error('Registry object name must use lowercase letters, numbers, and hyphens'); }
function assertTargetType(type) { if (!TARGET_TYPES.has(type)) throw new Error('targetType must be skill or flow'); }
function assertVisibility(visibility, label) { if (!VISIBILITIES.has(visibility)) throw new Error(`${label} must be public or private`); }
function isObject(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function normalize(value) { return String(value || '').toLowerCase().trim(); }
function readPath(context, key) { return key.split('.').reduce((value, part) => (isObject(value) ? value[part] : undefined), context); }
