---
name: skill-author
description: Implement Agent Registry Skill, Flow, and Suite packages on non-main branches with canonical paths, safe manifests, progressive disclosure, validation, eval coverage, and minimal duplication.
---

# Mission

Implement approved Registry architecture without changing object semantics or duplicating source-of-truth instructions.

# Canonical packages

- Skill: `skills/<name>/SKILL.md` with optional `references/`, `scripts/`, `assets/`, `evals/`.
- Flow: `flows/<name>/FLOW.json` with optional `evals/`.
- Suite: `suites/<name>/SUITE.json` with optional `evals/`.

Never nest Skills or Flows under Suites. Never write Registry objects at repository root.

# Skill authoring

Preserve existing Skill authoring rules: core workflow, triggers/non-triggers, contracts, quality gates, handoffs, failure handling, progressive disclosure, and package-local resources. Suite membership must not alter standalone Skill instructions.

# Flow authoring

Use JSON. A v1 Flow manifest must identify itself as `kind: "flow"`, `schema_version: 1`, match directory/name, and define a DAG of `exact_skill` or `capability` steps.

Each step must define id, dependencies, boolean required status, declarative condition when needed, input handoff, and expected outputs. Handoffs reference declared Flow inputs or declared outputs of dependency steps. Do not copy Skill body text, Skill-specific prompts, or detailed Skill procedure into the Flow.

Exact Skill steps are pins. Do not add implicit substitutions. Capability steps carry a discovery query and may permit dynamic compose when the design requires it. Do not author subflow references in v1.

# Suite authoring

Use JSON. A v1 Suite manifest must identify itself as `kind: "suite"`, `schema_version: 1`, match directory/name, and reference member Skills/Flows without ownership. Optional policies, quality gates, and artifact-contract references are context-scoped and must not be described as globally injected member behavior.

# Visibility and paths

Public Flow/Suite manifests may reference public objects only. Private objects may explicitly reference public or private objects. Use the generalized Registry path guard for writes/deletes; preserve legacy Skill path compatibility.

# Change workflow

Use a non-main branch. Perform write → validation/secret scan → diff inspection → reviewer. Do not create a PR unless requested or authorized.

# Definition of done

Authoring is complete when paths are canonical, JSON parses, validators pass, exact/capability semantics are preserved, no Skill How is duplicated into a Flow, Suite membership is non-owning, security boundaries hold, evals cover routing/integrity regressions, and reviewer receives the complete diff.
