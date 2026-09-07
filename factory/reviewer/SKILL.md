---
name: skill-reviewer
description: Audit Agent Skill packages and Factory changes for correctness, Registry-first build semantics, mutation authorization, visibility-aware search, Candidate Skill Inspection, Reuse Boundary Check, Flow representability, placement, boundaries, contracts, eval coverage, security, validation, and regression risk.
---

# Mission

Review the complete changed package and diff, not only SKILL.md. Report blocking issues clearly and do not modify files unless the user requested refactor/change mode.

# Required Skill package checks

For a completed Skill, verify:

## Placement

- all package files are under `skills/<skill-name>/`;
- required `skills/<skill-name>/SKILL.md` exists;
- no root-level `<skill-name>/` package remains;
- no absolute path, traversal, or accidental cross-Skill write exists.

## Progressive Disclosure

- SKILL.md contains the core workflow and critical decisions;
- long rubrics, pattern lists, medium/industry guidance, detailed checklists, and long examples are externalized when conditional;
- essential decision rules have not been moved out so aggressively that ordinary execution requires every reference;
- SKILL.md explicitly says when each reference should be loaded;
- no unused or duplicative reference exists;
- a SKILL.md above roughly 150–200 lines received an explicit disclosure review rather than an automatic split.

## Skill boundary

- responsibility is coherent and not overloaded with unrelated capabilities unless genuinely the same reusable responsibility;
- a natural core workflow has not been fragmented into unnecessary micro-Skills;
- trigger and non-trigger are clear.

## Contract and composition readiness

Check when relevant:

- responsibility;
- inputs and outputs;
- quality gate;
- handoff_in / handoff_out semantics;
- failure modes;
- loose coupling to upstream/downstream Skills.

## Evals

Expect behavior coverage appropriate to the Skill, including positive trigger, implicit trigger, explicit trigger, negative trigger, near-miss, known-good, known-bad, and regressions for prior failures.

## Safety and repository policy

- validateSkill passes;
- secret scan passes;
- public/private boundary is preserved;
- read-only use/audit work caused no repository mutation;
- PR creation matches explicit user authorization.

# Registry-first Build Pipeline review — v0.10 + Reuse Boundary Check v1

Review these as independent checks for every relevant Factory/Registry change. A failure in any applicable item is blocking:

1. ordinary-task mutation;
2. mutation authorization;
3. pipeline ordering;
4. visibility-aware search;
5. strong candidate SKILL.md inspection;
6. boundary evidence;
7. no internal sub-step duplication;
8. explicit non-split rule;
9. partial-fit handling;
10. create splitJustification;
11. complete gap evidence;
12. duplicate avoidance;
13. extension evidence + required dependent scopes;
14. breaking-change handling;
15. Flow-first design;
16. all-capabilities-existing case;
17. compose persistence boundary;
18. Flow v1 representability;
19. no representability distortion.

Dependent existence alone is not a pass/fail criterion for extension. Review whether dependent evidence was actually used to assess backward compatibility and migration risk.

# Flow package checks

For a completed Flow, verify canonical placement/name, valid JSON/schema/DAG, unique step ids, no cycles, exact Skill no-substitution, capability discovery semantics, handoff/output consistency, declarative conditions, completion requiring all applicable required steps, no Flow recursion where unsupported, no copied Skill How, and public/private safety.

# Suite package checks

For a completed Suite, verify canonical placement/name, valid non-owning member references, context-scoped policies/gates/contracts, discovery-scope semantics, and public/private safety.

# Factory change review

For runtime/Factory changes, verify existing modes and routes remain available, new behavior is covered by evals, implementation and instructions agree, and code guards enforce structural invariants when practical.

Regression-check exact invocation, discover, recommend, dynamic compose, saved Flow execution, Suite scope, dependency cycles, missing exact refs, public→private rejection, declarative conditions, required-step completion, legacy Registry/API behavior, and public/private boundaries.

Also verify generalized Registry write/delete path guards preserve valid existing Skill paths, Flow/Suite JSON uses no unnecessary parser dependency, and `api/openapi.js` / `gpt/openapi.yaml` stay aligned without deleting existing API contracts.

# Flow v2 MVP review — model / tool first-class steps

This section adds v2 checks without changing any v1 requirement above.

## Backward compatibility

- `schema_version: 1` continues to support only `exact_skill` and `capability`.
- no v1 Flow is auto-migrated or rewritten;
- v1 exact Skill substitution remains forbidden;
- v1 DAG/handoff/condition/completion/visibility semantics are unchanged.

## v2 supported types

For `schema_version: 2`, allow only:

- `exact_skill`
- `capability`
- `model`
- `tool`

`exact_skill`/`capability` retain v1 semantics.

## model blocking checks

- `instruction` is a non-empty string;
- `expected_output` is a non-empty array;
- existing handoff language is used;
- no `skill`, top-level `capability`, `tool`, or `arguments` fields;
- no provider/model pinning;
- runtime guidance forbids external-state/tool/web/API/connector/plugin acquisition from a model step.

## tool blocking checks

- `tool` object exists;
- `tool.mode` is `exact` or `capability`;
- `tool.effect` is `read_only` or `mutating`;
- exact requires non-empty `name` and forbids tool.capability;
- capability requires non-empty tool.capability and forbids `name`;
- arguments is an object if present;
- no top-level skill/capability/instruction;
- no auth-bypass fields such as `skip_confirmation`, `auto_approve`, `bypass_auth`, including nested arguments.

Exact binding must not silently substitute. Capability binding tool availability is runtime state, not build-time representability. A read-only declaration blocks mutating or unknown-effect tools. Mutating does not bypass runtime authorization/confirmation/safety.

## output and runtime failures

Downstream contracts may use only declared expected outputs. Missing required expected output is `STEP_OUTPUT_INVALID`; never infer missing tool data with a model.

Runtime failure semantics include `SKILL_NOT_FOUND`, `TOOL_UNAVAILABLE`, `TOOL_AUTH_DENIED`, `MODEL_UNAVAILABLE`, `STEP_TIMEOUT`, `STEP_OUTPUT_INVALID`. Required-step failure prevents full success; never auto-delete/optionalize/replace a required step.

Limited retry is acceptable for transient model/read-only tool failure. Mutating tool automatic retry is blocked absent a future idempotency contract.

## architecture checks

For Flow v2:

- disposition=`model` → `model` step;
- disposition=`external_tool` → `tool` step;
- no schema-fitting Skill for either;
- `unsupported_flow_capability` remains for nested Flow, loop, arbitrary code, explicit human-approval step, or another unsupported required primitive;
- v2 must not fail solely because `model`/`external_tool` are present.

Canonical USD/JPY v2 requires a read-only capability-bound tool step producing `rate/change/comparison_basis/as_of/source` followed by a model step producing `comment`, with no new Skill.

## API checks

No new API endpoint or GPT Action operation is required. Existing Flow read/search/validate/preflight/write paths should become version-aware through the shared validator.

# Decision

Return PASS only when no blocking correctness, security, placement, boundary, mutation-authorization, visibility-search, Candidate Skill Inspection, Reuse Boundary Check, Flow v1/v2 representability, output-integrity, authorization, or regression issue remains. Distinguish production-runtime-not-yet-updated checks from actual branch-source failures.
