# Architecture

## Principle

GitHub is source of truth. Agent Skill Factory separates read-only execution from explicitly authorized Registry mutation. Registry-first Build Pipeline and Reuse Boundary Check remain the front door for reusable creation.

## Registry-first Build Pipeline

`Creation Gate → Registry Search → Candidate Skill Inspection → Reuse Boundary Check → Capability Gap Plan → Architect → Author → Reviewer`

Strong candidate SKILL.md inspection, existing ownership reuse, partial-fit extend-first, create splitJustification, visibility-aware search, dependent-impact checks, explicit non-split boundaries, and no automatic Skillizer remain unchanged.

## Flow schema compatibility

### v1

`schema_version:1` supports only `exact_skill` and `capability`. Existing v1 Flows are not migrated or rewritten. Preserve exact no-substitution, capability discovery, DAG, handoff, condition, completion, public/private references, and Suite behavior.

### v2

`schema_version:2` supports `exact_skill`, `capability`, `model`, `tool`.

Existing common DAG/handoff/completion helpers are shared where possible. Validator behavior is version-aware; v1 logic is not broadened to accept v2-only steps.

## model step

A model step is a pure LLM-native execution primitive for Capability Gap Plan disposition=`model`. It requires a non-empty instruction and declared outputs. It uses the current host/runtime LLM and does not pin a provider/model in the manifest.

A model step cannot invoke external tools, web search, APIs, connectors, plugins, or current state. It may rely only on its instruction, Flow inputs, and resolved handoffs.

## tool step

A tool step is the Flow v2 representation of disposition=`external_tool`.

Bindings:

- capability: portable semantic capability, runtime chooses an available matching tool;
- exact: pinned tool name, no silent substitution.

`effect=read_only|mutating` is a maximum effect, not a permission grant. Read-only blocks a mutating or unknown-effect runtime tool. Mutating still obeys platform authorization, user confirmation, and safety policy. No manifest-level bypass mechanism exists.

Build-time representability and runtime availability are separate. Capability-bound tool steps can validate when no tool is currently connected; runtime absence is `TOOL_UNAVAILABLE`.

## Output integrity

All step-to-step contracts use only declared `expected_output` fields and existing paths `flow.<input>` / `steps.<step-id>.<output>`. Missing required expected fields produce `STEP_OUTPUT_INVALID`. Missing tool data is never invented or inferred by a downstream model.

## Runtime failures

Stable MVP failure semantics include `SKILL_NOT_FOUND`, `TOOL_UNAVAILABLE`, `TOOL_AUTH_DENIED`, `MODEL_UNAVAILABLE`, `STEP_TIMEOUT`, `STEP_OUTPUT_INVALID`. Required-step failure prevents Flow full success.

Retry policy is runtime-only for MVP: limited transient retry for model/read-only tool; no automatic retry for mutating tool absent a future idempotency contract.

## Capability Gap Plan / Architect

Dispositions remain `reuse / extend / create / model / external_tool`.

For v2:

- `model` → model step;
- `external_tool` → tool step.

Do not create schema-fitting Skills for either.

`unsupported_flow_capability` remains for required primitives outside the selected schema/runtime, including nested Flow, loop, arbitrary code, explicit human-approval step, or another unsupported primitive. v1 still cannot represent direct model/tool; v2 can.

## Canonical USD/JPY Flow v2

A required read-only capability-bound tool retrieves current USD/JPY rate, change, comparison basis, timestamp, and source. A required model step receives those declared outputs and writes a short Japanese comment without inventing unsupported movement/causes. No Skill is created solely for either step.

## Public/private and repository safety

Public Registry objects may reference public Registry objects only. Private may reference public/private. Dependency scanning, whole-batch preflight, stale SHA protection, exact Skill semantics, saved Flow routing, dynamic compose, and Suite non-owning semantics remain unchanged.

## API

Flow v2 reuses existing Flow get/list/search/validate/preflight/write routes. No new endpoint or GPT Action operation is required.
