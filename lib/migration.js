import { repoForVisibility } from './config.js';
import { putTextFileIfSha } from './github.js';
import { getSkill, validateSkillText } from './skills.js';
import {
  findRegistryDependents,
  getFlow,
  getSuite,
  validateFlowPackage,
  validateSuitePackage
} from './registry.js';

const TYPES = new Set(['skill', 'flow']);
const VISIBILITIES = new Set(['public', 'private']);
const NAME_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;

export async function planRegistryReferenceMigration(request) {
  const input = normalizeRequest(request);
  const source = await inspectEndpoint(input.targetType, input.from);
  if (!source.ok) return blockedPlan(input, 'source_unavailable', source.reason, { source });

  const destination = await inspectEndpoint(input.targetType, input.to, true);
  if (!destination.ok) return blockedPlan(input, 'destination_unavailable', destination.reason, { source, destination });
  if (!destination.validation?.ok) {
    return blockedPlan(input, 'destination_invalid', 'Destination object failed validation', { source, destination });
  }

  if (input.dependentVisibility === 'public' && input.to.visibility === 'private') {
    return blockedPlan(input, 'visibility_incompatible', 'Public dependents cannot reference private Registry objects', { source, destination });
  }

  let dependents;
  try {
    dependents = await findRegistryDependents({
      targetType: input.targetType,
      targetName: input.from.name,
      targetVisibility: input.from.visibility,
      dependentVisibility: input.dependentVisibility,
      ref: input.dependentRef
    });
  } catch (e) {
    return blockedPlan(input, 'dependent_scan_failed', e.message, { source, destination });
  }

  const grouped = groupDependents(dependents);
  const files = [];
  const errors = [];
  let blockingReason = null;

  for (const [manifestPath, refs] of grouped) {
    try {
      const preview = await buildManifestPreview(input, manifestPath, refs);
      files.push(preview);
      if (!preview.baseline_validation.ok) {
        blockingReason ||= 'baseline_invalid';
        errors.push(`${manifestPath}: dependent manifest is invalid at dependentRef before migration`);
        continue;
      }
      if (!preview.validation_preview.ok) {
        if (hasDestinationResolutionError(preview.validation_preview, input.targetType, input.to)) {
          blockingReason ||= 'destination_not_resolvable_from_dependent_ref';
          errors.push(`${manifestPath}: destination is not resolvable using normal dependentRef semantics`);
        } else {
          blockingReason ||= 'preflight_validation_failed';
          errors.push(`${manifestPath}: proposed manifest validation failed at dependentRef`);
        }
      }
    } catch (e) {
      blockingReason ||= 'preflight_validation_failed';
      errors.push(`${manifestPath}: ${e.message}`);
    }
  }

  const expectedFiles = files.map((file) => ({
    path: file.manifest_path,
    sha: file.expected_sha
  }));

  if (errors.length) {
    return {
      ok: true,
      blocked: true,
      migration_possible: false,
      reason: blockingReason || 'preflight_validation_failed',
      errors,
      source: endpointIdentity(input.targetType, input.from),
      destination: endpointIdentity(input.targetType, input.to),
      destination_status: destination,
      dependent_scan: scanIdentity(input),
      dependent_count: dependents.length,
      dependents,
      files,
      expectedFiles
    };
  }

  return {
    ok: true,
    blocked: false,
    migration_possible: true,
    source: endpointIdentity(input.targetType, input.from),
    destination: endpointIdentity(input.targetType, input.to),
    destination_status: destination,
    dependent_scan: scanIdentity(input),
    dependent_count: dependents.length,
    dependents,
    files,
    expectedFiles
  };
}

export async function applyRegistryReferenceMigration(request) {
  const input = normalizeRequest(request);
  const expected = normalizeExpectedFiles(request?.expectedFiles);
  if (!expected.ok) {
    return {
      ok: true,
      blocked: true,
      reason: 'invalid_expected_files',
      message: expected.message,
      migrated_count: 0
    };
  }

  const plan = await planRegistryReferenceMigration(input);
  if (plan.blocked || !plan.migration_possible) return { ...plan, apply: false };

  const planPaths = new Set(plan.files.map((file) => file.manifest_path));

  for (const file of plan.files) {
    if (!expected.byPath.has(file.manifest_path)) {
      return {
        ok: true,
        blocked: true,
        reason: 'stale_plan',
        message: `Missing expected file entry for ${file.manifest_path}`,
        manifest_path: file.manifest_path,
        migrated_count: 0
      };
    }
    const suppliedSha = expected.byPath.get(file.manifest_path);
    if (suppliedSha !== file.expected_sha) {
      return {
        ok: true,
        blocked: true,
        reason: 'sha_mismatch',
        message: `Stale plan for ${file.manifest_path}`,
        manifest_path: file.manifest_path,
        expected_sha: suppliedSha,
        current_sha: file.expected_sha,
        migrated_count: 0
      };
    }
  }

  const unexpected = expected.entries
    .filter((entry) => !planPaths.has(entry.path))
    .map((entry) => entry.path);
  if (unexpected.length) {
    return {
      ok: true,
      blocked: true,
      reason: 'stale_plan',
      message: 'expectedFiles contains manifests that are no longer migration targets',
      unexpected_paths: unexpected,
      migrated_count: 0
    };
  }

  const repo = repoForVisibility(input.dependentVisibility);
  const writes = [];
  try {
    for (const file of plan.files) {
      const result = await putTextFileIfSha(
        repo,
        file.manifest_path,
        file.proposed_content,
        input.dependentRef,
        file.expected_sha,
        request.message || `Migrate Registry reference in ${file.manifest_path}`
      );
      writes.push({
        manifest_path: file.manifest_path,
        commit: result.commit?.sha || null,
        content_sha: result.content?.sha || null
      });
    }
  } catch (e) {
    const verification = await verifyMigration(input, plan.files);
    return {
      ok: false,
      blocked: true,
      reason: 'partial_failure',
      error: e.message,
      migrated_count: writes.length,
      writes,
      ...verification
    };
  }

  const verification = await verifyMigration(input, plan.files);
  const validationOk = verification.validation_results.every((item) => item.ok);
  const reverseScanOk = verification.remaining_old_dependency_count === 0;
  return {
    ok: validationOk && reverseScanOk,
    blocked: false,
    migrated_count: writes.length,
    writes,
    ...verification
  };
}

async function buildManifestPreview(input, manifestPath, refs) {
  const dependentType = refs[0]?.dependent_type;
  const loaded = dependentType === 'flow'
    ? await getFlow(input.dependentVisibility, refs[0].dependent_name, input.dependentRef)
    : await getSuite(input.dependentVisibility, refs[0].dependent_name, input.dependentRef);

  const baselineValidation = await validateDependentManifest({
    input,
    dependentType,
    dependentName: refs[0].dependent_name,
    content: loaded.content
  });

  if (!baselineValidation.ok) {
    return {
      dependent_type: dependentType,
      dependent_name: refs[0].dependent_name,
      dependent_visibility: input.dependentVisibility,
      manifest_path: manifestPath,
      reference_kinds: [...new Set(refs.map((ref) => ref.reference_kind))],
      changes: [],
      expected_sha: loaded.sha,
      baseline_validation: baselineValidation,
      validation_preview: { ok: false, errors: ['Baseline manifest is invalid at dependentRef'] },
      proposed_content: loaded.content
    };
  }

  const manifest = structuredClone(loaded.manifest);
  const changes = refs.map((ref) => applyReferenceChange(manifest, ref, input));
  const proposedContent = `${JSON.stringify(manifest, null, 2)}\n`;
  const validationPreview = await validateDependentManifest({
    input,
    dependentType,
    dependentName: refs[0].dependent_name,
    content: proposedContent
  });

  return {
    dependent_type: dependentType,
    dependent_name: refs[0].dependent_name,
    dependent_visibility: input.dependentVisibility,
    manifest_path: manifestPath,
    reference_kinds: [...new Set(refs.map((ref) => ref.reference_kind))],
    changes,
    expected_sha: loaded.sha,
    baseline_validation: baselineValidation,
    validation_preview: validationPreview,
    proposed_content: proposedContent
  };
}

async function validateDependentManifest({ input, dependentType, dependentName, content }) {
  return dependentType === 'flow'
    ? validateFlowPackage({
        visibility: input.dependentVisibility,
        name: dependentName,
        ref: input.dependentRef,
        flowJson: content
      })
    : validateSuitePackage({
        visibility: input.dependentVisibility,
        name: dependentName,
        ref: input.dependentRef,
        suiteJson: content
      });
}

function hasDestinationResolutionError(validation, targetType, endpoint) {
  const messages = new Set();
  if (targetType === 'skill') {
    messages.add(`Exact Skill reference not found or unreadable: ${endpoint.visibility}/${endpoint.name}`);
    messages.add(`Skill member not found or unreadable: ${endpoint.visibility}/${endpoint.name}`);
  } else {
    messages.add(`Flow member not found or unreadable: ${endpoint.visibility}/${endpoint.name}`);
  }
  return (validation.errors || []).some((error) => messages.has(error));
}

function normalizeExpectedFiles(value) {
  if (!Array.isArray(value)) {
    return { ok: false, message: 'expectedFiles must be an array of {path, sha} entries' };
  }

  const entries = [];
  const byPath = new Map();
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    if (!isObject(item)) {
      return { ok: false, message: `expectedFiles[${index}] must be an object` };
    }
    if (typeof item.path !== 'string' || !item.path.trim()) {
      return { ok: false, message: `expectedFiles[${index}].path is required` };
    }
    if (byPath.has(item.path)) {
      return { ok: false, message: `Duplicate expectedFiles path: ${item.path}` };
    }
    if (typeof item.sha !== 'string' || !item.sha.trim()) {
      return { ok: false, message: `expectedFiles[${index}].sha is required` };
    }
    const entry = { path: item.path, sha: item.sha };
    entries.push(entry);
    byPath.set(entry.path, entry.sha);
  }

  return { ok: true, entries, byPath };
}

function applyReferenceChange(manifest, dependent, input) {
  let holder;
  if (dependent.reference_kind === 'exact_skill') {
    holder = manifest.steps?.[dependent.reference_location?.step_index]?.skill;
  } else if (dependent.reference_kind === 'suite_skill_member') {
    holder = manifest.members?.skills?.[dependent.reference_location?.member_index];
  } else if (dependent.reference_kind === 'suite_flow_member') {
    holder = manifest.members?.flows?.[dependent.reference_location?.member_index];
  }
  if (!isObject(holder)) throw new Error(`Reference location is no longer valid: ${dependent.reference_kind}`);

  const oldReference = { ...holder };
  const oldEffectiveVisibility = holder.visibility || input.dependentVisibility;
  if (holder.name !== input.from.name || oldEffectiveVisibility !== input.from.visibility) {
    throw new Error('Reference no longer matches the source identity');
  }

  holder.name = input.to.name;
  const wasExplicit = Object.prototype.hasOwnProperty.call(oldReference, 'visibility');
  if (wasExplicit) {
    holder.visibility = input.to.visibility;
  } else if (input.to.visibility === input.dependentVisibility) {
    delete holder.visibility;
  } else {
    holder.visibility = input.to.visibility;
  }

  return {
    reference_kind: dependent.reference_kind,
    reference_location: dependent.reference_location,
    old_reference: oldReference,
    proposed_new_reference: { ...holder }
  };
}

async function verifyMigration(input, files) {
  const validationResults = [];
  for (const file of files) {
    const parsed = parseManifestPath(file.manifest_path);
    try {
      const current = parsed.type === 'flow'
        ? await getFlow(input.dependentVisibility, parsed.name, input.dependentRef)
        : await getSuite(input.dependentVisibility, parsed.name, input.dependentRef);
      const result = await validateDependentManifest({
        input,
        dependentType: parsed.type,
        dependentName: parsed.name,
        content: current.content
      });
      validationResults.push({ manifest_path: file.manifest_path, ok: result.ok, validation: result });
    } catch (e) {
      validationResults.push({ manifest_path: file.manifest_path, ok: false, error: e.message });
    }
  }

  let remaining = [];
  try {
    remaining = await findRegistryDependents({
      targetType: input.targetType,
      targetName: input.from.name,
      targetVisibility: input.from.visibility,
      dependentVisibility: input.dependentVisibility,
      ref: input.dependentRef
    });
  } catch (e) {
    return {
      validation_results: validationResults,
      remaining_old_dependency_count: null,
      remaining_old_dependencies: [],
      verification_error: e.message
    };
  }

  return {
    validation_results: validationResults,
    remaining_old_dependency_count: remaining.length,
    remaining_old_dependencies: remaining
  };
}

async function inspectEndpoint(targetType, endpoint, validate = false) {
  try {
    if (targetType === 'skill') {
      const skill = await getSkill(endpoint.visibility, endpoint.name, endpoint.ref);
      const validation = validate ? validateSkillText(skill.content || '') : { ok: true };
      return { ok: true, exists: true, validation, sha: skill.sha || null };
    }
    const flow = await getFlow(endpoint.visibility, endpoint.name, endpoint.ref);
    const validation = validate
      ? await validateFlowPackage({ visibility: endpoint.visibility, name: endpoint.name, ref: endpoint.ref, flowJson: flow.content })
      : { ok: true };
    return { ok: true, exists: true, validation, sha: flow.sha || null };
  } catch (e) {
    return { ok: false, exists: false, reason: e.message };
  }
}

function normalizeRequest(request) {
  if (!isObject(request)) throw new Error('Migration request must be an object');
  if (!TYPES.has(request.targetType)) throw new Error('targetType must be skill or flow');
  const from = normalizeEndpoint(request.from, 'from');
  const to = normalizeEndpoint(request.to, 'to');
  if (!VISIBILITIES.has(request.dependentVisibility)) throw new Error('dependentVisibility must be public or private');
  if (typeof request.dependentRef !== 'string' || !request.dependentRef.trim()) throw new Error('dependentRef is required');
  return {
    targetType: request.targetType,
    from,
    to,
    dependentVisibility: request.dependentVisibility,
    dependentRef: request.dependentRef
  };
}

function normalizeEndpoint(endpoint, label) {
  if (!isObject(endpoint)) throw new Error(`${label} must be an object`);
  if (!NAME_RE.test(endpoint.name || '')) throw new Error(`${label}.name is invalid`);
  if (!VISIBILITIES.has(endpoint.visibility)) throw new Error(`${label}.visibility must be public or private`);
  if (typeof endpoint.ref !== 'string' || !endpoint.ref.trim()) throw new Error(`${label}.ref is required`);
  return { name: endpoint.name, visibility: endpoint.visibility, ref: endpoint.ref };
}

function groupDependents(dependents) {
  const grouped = new Map();
  for (const dependent of dependents) {
    const list = grouped.get(dependent.manifest_path) || [];
    list.push(dependent);
    grouped.set(dependent.manifest_path, list);
  }
  return grouped;
}

function blockedPlan(input, reason, message, extra = {}) {
  return {
    ok: true,
    blocked: true,
    migration_possible: false,
    reason,
    message,
    source: endpointIdentity(input.targetType, input.from),
    destination: endpointIdentity(input.targetType, input.to),
    dependent_scan: scanIdentity(input),
    ...extra,
    files: [],
    expectedFiles: []
  };
}

function endpointIdentity(type, endpoint) {
  return { type, name: endpoint.name, visibility: endpoint.visibility, ref: endpoint.ref };
}

function scanIdentity(input) {
  return { visibility: input.dependentVisibility, ref: input.dependentRef };
}

function parseManifestPath(path) {
  let match = path.match(/^flows\/([^/]+)\/FLOW\.json$/);
  if (match) return { type: 'flow', name: match[1] };
  match = path.match(/^suites\/([^/]+)\/SUITE\.json$/);
  if (match) return { type: 'suite', name: match[1] };
  throw new Error(`Unsupported dependent manifest path: ${path}`);
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
