# Multi-Skill and Saved Flow Runtime

Load this reference after the orchestrator selects dynamic composition or saved Flow execution.

## Dynamic composition

Select the smallest Skill set that completes the goal. Do not compose when one Skill owns the coherent workflow, when steps are merely internal stages, or when model judgment between Skills is enough. Maintain an internal execution plan with goal, selected Skills, order, responsibilities, inputs, outputs, handoffs, dependencies, and completion condition.

Dynamic compose is read-only temporary execution and never implies persistence.

## Existing Skill handoff

Pass only downstream contract data. Never dump complete upstream instructions/references. Do not execute downstream work with missing required input. Public/private Skills may be combined read-only, but private material must not be written publicly.

## Saved Flow common semantics

Validate first. Honor DAG dependencies, `required`, declarative `condition.when`, `input_handoff`, `expected_output`, and `completion.required_steps=all_required`.

Supported handoff sources remain only:

- `flow.<input>`
- `steps.<step-id>.<output>`

A downstream handoff/output reference must target a field declared in the upstream step's `expected_output`.

Applicable required-step failure prevents full success.

## Flow v1

`schema_version:1` supports `exact_skill` and `capability` only. Keep exact Skill no-substitution and capability Skill-discovery semantics unchanged. Do not auto-migrate v1.

## Flow v2

`schema_version:2` adds `model` and `tool` while preserving v1 step semantics.

### model execution

1. Resolve flow inputs and input handoffs.
2. Read the manifest `instruction`.
3. Execute with the current host/runtime LLM only.
4. Do not invoke tools, web search, connectors, plugins, external APIs, or current external state.
5. Normalize only fields declared by `expected_output`.
6. Missing required expected field → `STEP_OUTPUT_INVALID`.

Provider/model identity is runtime policy, not Flow manifest configuration.

### tool execution

1. Resolve `tool.mode`.
2. For exact binding, require the named tool; no silent substitution. Missing → `TOOL_UNAVAILABLE`.
3. For capability binding, choose an available matching runtime tool; no match → `TOOL_UNAVAILABLE`.
4. Check actual tool effect against manifest maximum effect.
5. `read_only` + mutating/unknown actual effect → block with `TOOL_AUTH_DENIED`.
6. Apply normal tool/platform authorization, user confirmation, and safety policy. Manifest `mutating` never bypasses them.
7. Pass manifest `arguments` plus resolved handoff inputs.
8. Normalize only declared expected outputs; never invent missing fields.
9. Missing expected field → `STEP_OUTPUT_INVALID`.

Tool availability is evaluated at runtime, not by build-time capability representability.

## Failure semantics

Use these stable Flow runtime failure codes where applicable:

- `SKILL_NOT_FOUND`
- `TOOL_UNAVAILABLE`
- `TOOL_AUTH_DENIED`
- `MODEL_UNAVAILABLE`
- `STEP_TIMEOUT`
- `STEP_OUTPUT_INVALID`

Do not silently remove, optionalize, or replace a failed required step and still claim full success.

## Retry MVP

- transient model failure: limited retry allowed;
- transient read-only tool failure: limited retry allowed;
- mutating tool: no automatic retry until a future idempotency contract exists.

## Replanning

Dynamic composition may replan when a selected Skill is unsuitable or handoff is incomplete. A saved Flow must preserve its manifest semantics: exact Skill substitution is forbidden and required steps cannot be semantically replaced merely to obtain success.
