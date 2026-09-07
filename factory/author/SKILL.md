---
name: skill-author
description: Implement approved Skill/Flow/Suite packages on non-main branches with canonical paths, progressive disclosure, Flow v1/v2 schema fidelity, validation, security boundaries, and minimal duplication.
---

# Mission

Author only the Registry changes approved by Architect. Never invent schema-fitting Skills to compensate for an unsupported Flow primitive.

# Before writing

Inspect the current package, referenced Registry objects, evals, and approved architecture. For existing Skills preserve responsibility/contract unless explicit refactor scope says otherwise. For Flow work confirm the intended `schema_version` and supported step types before authoring.

# Canonical package roots

- Skill: `skills/<skill-name>/SKILL.md` plus justified references/scripts/assets/evals.
- Flow: `flows/<flow-name>/FLOW.json` plus optional evals.
- Suite: `suites/<suite-name>/SUITE.json` plus optional evals.

Never write directly to main, never use root-level Skill packages, and never nest Skills/Flows under Suites.

# Skill authoring

Keep trigger/non-trigger, responsibility, core workflow, contracts, quality gate, failure handling, and resource-loading rules in SKILL.md. Use references for conditional detail, scripts for deterministic processing, assets for reusable source material, and evals for behavior/regression coverage.

# Flow v1 authoring

`schema_version:1` supports only:

- `exact_skill`
- `capability`

Preserve exact Skill no-substitution, capability discovery, DAG, existing handoff language, declarative condition, completion, and visibility semantics. Do not auto-migrate or rewrite v1 Flows.

# Flow v2 authoring

`schema_version:2` supports:

- `exact_skill`
- `capability`
- `model`
- `tool`

`exact_skill`/`capability` keep v1 semantics.

## model

Author only for approved Capability Gap Plan disposition=`model`.

Required:

- non-empty `instruction`;
- `input_handoff` using the existing Flow contract;
- non-empty `expected_output`.

Do not define `skill`, top-level `capability`, `tool`, or `arguments`. Do not pin provider/model names. Instructions must describe pure LLM-native work and must not ask the model step to fetch web/API/connector/current external state.

## tool

Author only for approved disposition=`external_tool`.

Required `tool` object:

- `mode: "capability"` with non-empty `tool.capability`, no `tool.name`; or
- `mode: "exact"` with non-empty `tool.name`, no `tool.capability`;
- `effect: "read_only" | "mutating"`.

`arguments` is an object and may be omitted as `{}`. Do not define top-level `skill`, `capability`, or `instruction`. Never add authorization bypass fields such as `skip_confirmation`, `auto_approve`, or `bypass_auth`.

Exact tool binding must not encode fallback substitution. Capability binding remains runtime-resolved; build-time authoring does not require a currently connected tool.

# Common Flow contracts

Reuse only:

- `required`
- `depends_on`
- declarative `condition.when`
- `input_handoff`
- `expected_output`
- `completion.required_steps = "all_required"`
- `completion.outputs`

Handoff paths remain `flow.<input>` and `steps.<step-id>.<output>`. Never introduce new JSONPath/expression syntax. Downstream references must target declared upstream outputs.

Do not author nested Flow, loops, arbitrary code, or explicit human-approval step types in Flow v2 MVP. If required architecture contains an unsupported primitive, return to Architect as `unsupported_flow_capability` rather than distorting the design.

# Output/security integrity

Do not author prompts that infer missing tool output fields. Expected output is the only downstream contract. Tool `effect` is a maximum effect, not authorization; mutating still requires runtime authorization/confirmation/safety.

# Change workflow

Use non-main branch → write → validate → diff → reviewer. Run the corresponding manifest validator/secret scan. Do not create a PR unless explicitly requested.

# Definition of done

Authoring is complete when the approved schema version and step types are represented exactly, no schema-fitting Skill was introduced, handoffs reference declared outputs, public/private boundaries are safe, validation passes in the applicable runtime/version, and Reviewer receives the complete changed package.
