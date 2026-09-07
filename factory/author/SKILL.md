---
name: skill-author
description: Implement Agent Skill packages on non-main branches with correct registry paths, progressive disclosure, explicit contracts, appropriate references/scripts/assets/evals, validation, and minimal duplication.
---

# Mission

Author complete Skill packages from an approved architecture. A Skill package is not synonymous with one SKILL.md file.

Flow and Suite packages are additional first-class Registry package types; their authoring must preserve every Skill-package rule below for Skills.

# Before writing

For a new Skill, confirm:

- target package path;
- package structure;
- what must remain in SKILL.md;
- what belongs in references;
- whether scripts are justified;
- whether assets are justified;
- what evals are required.

For an existing Skill, inspect before changing:

1. current `SKILL.md`;
2. directory structure;
3. references;
4. scripts;
5. assets;
6. evals.

Do not recreate information that already exists in another package file.

For Flow/Suite work, likewise inspect the current manifest, package directory, evals, and referenced Registry objects before changing it.

# Registry path invariant

Skill packages must live under:

`skills/<skill-name>/`

Required:

`skills/<skill-name>/SKILL.md`

Optional:

- `skills/<skill-name>/references/`
- `skills/<skill-name>/scripts/`
- `skills/<skill-name>/assets/`
- `skills/<skill-name>/evals/`

Never write `<skill-name>/SKILL.md` at repository root. Reject absolute paths, traversal, and accidental writes into another Skill directory.

After writing, inspect the diff and confirm all intended Skill-package changes are under the expected `skills/<skill-name>/` root.

Additional canonical Registry packages are:

- `flows/<flow-name>/FLOW.json` with optional `evals/`;
- `suites/<suite-name>/SUITE.json` with optional `evals/`.

Never nest Skills or Flows beneath Suites. Use the generalized Registry path guard for Registry writes/deletes while retaining legacy Skill path compatibility.

# SKILL.md core

Keep always-needed execution material in SKILL.md:

- trigger and non-trigger;
- responsibility;
- core workflow;
- critical decision rules;
- input contract;
- output contract;
- quality gate;
- resource loading rules;
- failure handling;
- Definition of Done.

For composable Skills, make inputs/outputs and handoff expectations sufficiently explicit for loose coupling. Do not require one named upstream Skill when an input contract is enough.

# Progressive Disclosure

Load `references/progressive-disclosure.md` when the package contains substantial conditional detail or SKILL.md approaches roughly 150–200 lines.

Consider moving out:

- long rubrics and pattern lists;
- medium- or industry-specific guidance;
- detailed checklists;
- case-specific knowledge;
- long good/bad examples;
- long explanations of core rules.

Do not split mechanically by line count. Do not move essential judgment out if the core Skill can no longer execute straightforward requests without loading references.

Every reference must have a clear loading condition in SKILL.md. Avoid tiny overlapping references and unused files.

# Resource boundaries

Use:

- `references/` for conditional knowledge;
- `scripts/` for deterministic or repeated processing, validation, format checks, or static analysis;
- `assets/` for templates, images, reusable source files, or reference visuals;
- `evals/` for positive, implicit, explicit, negative, near-miss, known-good, known-bad, and regression behavior as relevant.

# Flow authoring

Use JSON for v1. FLOW.json must match its directory name, identify `kind: "flow"` and `schema_version: 1`, and define a DAG whose steps express id, target type, dependencies, boolean required status, optional limited declarative condition, input handoff, and expected outputs.

- `exact_skill` pins a specific Skill; do not author implicit substitutions.
- `capability` defines a capability query and may allow dynamic compose when the architecture requires it.
- handoffs reference declared Flow inputs or outputs declared by dependency steps;
- do not copy Skill body text, Skill-specific prompts, or detailed Skill procedure into the Flow;
- do not author Flow → Flow recursion in v1.

# Suite authoring

Use JSON for v1. SUITE.json must match its directory name, identify `kind: "suite"` and `schema_version: 1`, and reference member Skills/Flows without ownership. Optional policy, quality gates, and artifact-contract references are context-scoped only and must not be described as globally injected member behavior.

Public Flow/Suite manifests may reference public objects only. Private manifests may explicitly reference public or private objects.

# Change workflow

Use a non-main branch. Perform write → validate → diff, then hand the completed package to reviewer. Do not create a PR unless the user explicitly requested or authorized it.

For Flow/Suite packages, run the corresponding manifest validator and secret scan before diff review.

# Definition of done

Authoring is complete when:

- package path is canonical;
- SKILL.md contains the core and only the core;
- conditional resources are structured without duplication;
- eval coverage includes realistic triggers and regressions;
- validation and secret scan pass;
- diff stays within intended package boundaries;
- reviewer receives the complete package, not only SKILL.md.

For Flow/Suite packages, also require JSON/schema/reference validation, non-owning membership, exact/capability semantics, safe visibility, and no duplicated Skill How.

# Flow v2 MVP addendum — model / tool first-class steps

This addendum is version-scoped. Existing Flow v1 authoring above remains unchanged for `schema_version: 1`; v1 must not be auto-migrated or rewritten.

For `schema_version: 2`, allowed step types are `exact_skill`, `capability`, `model`, and `tool`. Exact/capability preserve v1 semantics.

Author a `model` step only for an approved Capability Gap Plan disposition=`model`. It requires non-empty `instruction`, normal `input_handoff`, and non-empty `expected_output`. Do not define `skill`, top-level `capability`, `tool`, or `arguments`; do not pin provider/model; do not instruct the step to fetch web/API/connector/plugin/current external state.

Author a `tool` step only for disposition=`external_tool`. `tool.mode` is `capability` or `exact`; `tool.effect` is `read_only` or `mutating`. Capability mode requires non-empty `tool.capability` and no `tool.name`; exact mode requires non-empty `tool.name` and no `tool.capability`. `arguments` is an object if present. Do not define top-level skill/capability/instruction or authorization-bypass fields such as `skip_confirmation`, `auto_approve`, or `bypass_auth`.

Exact tool binding must not encode fallback substitution. Capability binding is runtime-resolved and does not require a currently connected tool at build time.

Reuse the existing DAG/condition/handoff/expected-output/completion language only. Downstream references must target declared outputs. Missing required runtime output is `STEP_OUTPUT_INVALID`; do not invent missing tool data with a model.

Do not author nested Flow, loops, arbitrary code, or explicit human-approval step types in v2 MVP. If required, return `unsupported_flow_capability` to Architect instead of distorting the design.
