# Flow / Suite Registry v1 architecture decision

## Decision

The Registry has three independent first-class object roots: `skills/`, `flows/`, and `suites/`.

- Skill is a standalone reusable capability and remains the source of truth for implementation/How.
- Flow is a saved DAG execution plan for a known end-to-end task.
- Suite is a non-owning relationship/discovery scope over Skills and Flows, with optional context-only shared policy.
- compose remains a runtime-generated plan for uncovered multi-responsibility tasks.

No Skill or Flow is moved under a Suite. Membership cannot alter standalone execution.

## Flow v1 manifest

FLOW.json uses native JSON parsing and a small built-in validator; no YAML or schema library dependency is added.

Required root fields are `schema_version: 1`, `kind: "flow"`, `name`, `steps`, and `completion`. `inputs`, description, tags, and use metadata are optional.

A step has `id`, `type`, `depends_on`, `required`, `input_handoff`, and `expected_output`; `condition` is optional. Step types are `exact_skill` and `capability`. Flow-to-Flow nesting is rejected because no `flow` step type exists in v1. The tagged union leaves room for a future subflow type without changing existing exact/capability semantics.

Handoff sources are only `flow.<declared-input>` or `steps.<dependency-id>.<declared-output>`. This keeps Flow content orchestration-only and prevents Skill How duplication.

Conditions are only `{ "when": { "context.key": scalar } }` equality checks. No JavaScript, eval, expression language, or natural-language condition engine is accepted.

Completion v1 uses `required_steps: "all_required"`; every applicable required step must complete. Excluding an applicable required step cannot produce full success.

Exact Skill references may optionally declare visibility. Omitted visibility means same visibility as the Flow. A public Flow may reference only public Skills. An exact Skill is never silently substituted. Capability steps may dynamically use Skill discovery and may mark `compose: true` when multi-Skill dynamic resolution is intended.

## Suite v1 manifest

SUITE.json uses `schema_version: 1`, `kind: "suite"`, `name`, and `members.skills` / `members.flows`. Members are references only. Optional `policies`, `quality_gates`, and `artifact_contracts` are active only when Suite/Flow context is explicit.

A public Suite may reference only public Skills/Flows. A private Suite may explicitly reference public or private objects.

## Routing

Flow discovery remains separate from `searchSkills()`. Existing Skill search scoring is unchanged. Runtime selects by request granularity: local/single responsibility → Skill; strongly matching known end-to-end → Flow; uncovered multi-responsibility → compose. Explicit `$skill-name` remains Skill syntax; explicit Flow syntax is `$flow:<name>`.

## Contracts/versioning

The current Skill Registry does not expose a uniform machine-readable contract version in SKILL.md. v1 therefore does not pin commit SHAs or introduce a parallel versioning subsystem. Exact references are validated for existence/visibility, while semantic compatibility continues to be governed by the Skill's current contract text and runtime handoff validation. A future optional contract-version field can be added when the Skill contract itself becomes machine-readable.

## Write/history compatibility

`assertRegistryPath()` accepts only canonical `skills/<name>/...`, `flows/<name>/...`, or `suites/<name>/...`. The legacy `assertSkillRegistryPath()` remains available. API repository target `skill` remains a legacy alias; `registry` is added while `factory` remains distinct. History supports `skill`, `flow`, `suite`, and `factory`, with the legacy `/api/skill-history` route retained.
