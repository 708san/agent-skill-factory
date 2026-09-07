---
name: skill-reviewer
description: Audit Factory and Registry changes for Registry-first correctness, Reuse Boundary Check, Flow v1/v2 compatibility, model/tool step validation, security, runtime contracts, package integrity, and regression risk.
---

# Mission

Review the complete changed package/diff. Report blocking issues; do not modify files unless change mode explicitly requires it.

# Existing blocking checks

Preserve all Registry-first and Reuse Boundary Check gates: ordinary tasks never mutate; explicit mutation authorization; visibility-aware search; strong candidate SKILL.md inspection; no duplicate internal sub-responsibility Skill; explicit non-split boundaries; partial-fit extend consideration; create splitJustification; dependent checks; public/private boundary; no unnecessary Flow when one Skill owns the workflow; dynamic compose remains temporary.

Preserve v0.9.0 preflight, stale SHA, idempotency, diagnostics, compare/PR guard semantics.

# Flow v1 compatibility review

Blocking if any existing v1 semantics change unintentionally. `schema_version:1` must continue to accept only `exact_skill`/`capability`, preserve exact no-substitution, capability discovery, DAG, handoff, condition, completion, visibility, and Suite semantics. No automatic v1 migration/rewrite.

# Flow v2 package checks

For `schema_version:2`, permit exactly `exact_skill`, `capability`, `model`, `tool`.

## model

- non-empty `instruction`;
- non-empty `expected_output`;
- existing `input_handoff` contract;
- no `skill`, top-level `capability`, `tool`, `arguments`;
- manifest does not hard-code provider/model;
- runtime guidance forbids tool/web/API/connector/current-state acquisition from inside model step.

## tool

- required `tool` object;
- `mode=exact|capability`;
- `effect=read_only|mutating`;
- exact requires non-empty name and forbids tool.capability;
- capability requires non-empty capability and forbids tool.name;
- arguments object if present;
- no top-level skill/capability/instruction;
- no authorization bypass fields.

Exact binding must not silently substitute. Capability binding availability is runtime, not build-time validation. `read_only` must block mutating/unknown-effect runtime tools. `mutating` must not bypass authorization/confirmation/safety.

# Handoff/output/completion checks

Reuse the existing `flow.<input>` and `steps.<step-id>.<output>` language only. Handoffs and completion outputs may reference declared expected outputs only. Runtime must normalize only expected outputs and fail missing required fields with `STEP_OUTPUT_INVALID`. Never infer missing tool data with an LLM.

Required-step failure prevents full success. Never silently delete, optionalize, or semantically replace required steps.

# Runtime failure/retry checks

Guidance must define at least `SKILL_NOT_FOUND`, `TOOL_UNAVAILABLE`, `TOOL_AUTH_DENIED`, `MODEL_UNAVAILABLE`, `STEP_TIMEOUT`, `STEP_OUTPUT_INVALID`.

Limited transient retries may apply to model/read-only tool steps. Mutating tool automatic retry is blocked absent a future idempotency contract.

# Architecture representability checks

In v2, disposition=`model` must map to model step and `external_tool` to tool step without schema-fitting Skills. `unsupported_flow_capability` remains for nested Flow, loop, arbitrary code, explicit human-approval step, or other unsupported required primitives.

Blocking if the design still rejects v2 solely because `model`/`external_tool` are present.

# Canonical regression

USD/JPY Flow v2 must validate with a required capability-bound read-only tool step producing `rate/change/comparison_basis/as_of/source`, followed by required model step producing `comment`, with no new Skill.

# API/regression checks

No new endpoint/Action operation should be introduced for Flow v2. Existing get/list/search Flow, validate-flow, preflight, and write-files must use the version-aware validator. Preserve exact Skill, discover, recommend, saved Flow routing, dynamic compose, Suite semantics, dependency scanning, public/private boundaries, and existing API contracts.

# Decision

PASS only if v1 compatibility, v2 shape/security/output semantics, Registry-first/Reuse Boundary regressions, USD/JPY canonical validation, and compare/validation checks have no blocking issue.
