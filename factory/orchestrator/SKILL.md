---
name: skill-factory-orchestrator
description: Route Agent Skill Factory requests across read-only behavior and explicit Registry mutation; enforce Registry-first planning, Candidate Skill Inspection, Reuse Boundary Check, Flow v1/v2 representability, runtime routing, and repository safety.
---

# Mission

Coordinate Factory behavior while preserving current exact/discover/recommend/compose/saved Flow/Suite semantics. GitHub-backed Factory modules and Registry objects are source of truth.

# Mutation authorization

Classify first. `use`, read-only `audit`, and ordinary/meta are read-only and bypass Creation Gate. `create`, `refactor`, `split`, `merge`, `publish`, `rollback` require explicit change intent before persistence. Never auto-persist from ordinary tasks.

# Registry-first create pipeline

`Creation Gate → Registry Search → Candidate Skill Inspection → Reuse Boundary Check → Capability Gap Plan → Architect → Author → Reviewer`

Visibility-aware search, candidate SKILL.md inspection, Reuse Boundary Check, `extend`-before-`create` for partial fits, create `splitJustification`, public/private dependent checks, and explicit non-split boundaries remain unchanged.

Capability Gap Plan dispositions remain:

- `reuse`
- `extend`
- `create`
- `model`
- `external_tool`

# Flow version selection

Do not auto-migrate existing Flows.

- Flow v1 (`schema_version: 1`) supports only `exact_skill` and `capability`.
- Flow v2 (`schema_version: 2`) supports `exact_skill`, `capability`, `model`, and `tool`.

Use v1 when only v1 primitives are required and there is no reason to opt into v2. Use v2 when a required reusable process legitimately contains `model` or `external_tool` dispositions that should remain first-class rather than being distorted into Skills.

## Flow v2 mapping

- Capability Gap Plan `model` → Flow v2 `model` step.
- Capability Gap Plan `external_tool` → Flow v2 `tool` step.

Do not create Skills merely to satisfy Flow schema.

Tool availability is runtime state, not build-time representability. A capability-bound tool step can be architecturally valid without a currently connected matching tool. Runtime absence → `TOOL_UNAVAILABLE`.

`unsupported_flow_capability` remains blocking for required primitives outside the selected Flow schema/runtime, including nested Flow, loop, arbitrary code, explicit human-approval step, or another unsupported execution primitive. For Flow v1, required model/external_tool still block. For Flow v2 they do not block merely because of disposition.

# Flow v2 runtime contract

All existing DAG/handoff/condition/completion semantics are reused. No new path language is introduced: only `flow.<input>` and `steps.<step-id>.<output>`.

### exact_skill

Same as v1. No silent substitution. Missing exact Skill fails the required step.

### capability

Same as v1 Skill discovery semantics.

### model

Use the current host/runtime LLM. Read `instruction`, resolve Flow inputs/handoffs, and execute as a pure LLM-native step. Do not invoke web search, APIs, connectors, plugins, or external-state retrieval from inside a model step. Do not hard-code provider/model names in the manifest.

### tool

Resolve `tool.mode=exact|capability`. Exact binding must not silently substitute. Capability binding may choose an available matching runtime tool. Enforce `tool.effect` as the maximum allowed effect and then apply normal runtime authorization/confirmation/safety policy. A Flow never grants permissions.

For `read_only`, if actual effect is mutating or cannot be safely determined, block. `mutating` does not permit bypasses such as `skip_confirmation`, `auto_approve`, or `bypass_auth`.

Pass declared arguments plus resolved handoff inputs. Normalize only declared `expected_output` fields and never invent absent data.

# Output integrity and failures

If any required declared output is absent after a step, fail with `STEP_OUTPUT_INVALID`. Required-step failure prevents full success.

Runtime failure codes include `SKILL_NOT_FOUND`, `TOOL_UNAVAILABLE`, `TOOL_AUTH_DENIED`, `MODEL_UNAVAILABLE`, `STEP_TIMEOUT`, `STEP_OUTPUT_INVALID`.

MVP retries: limited transient retries are allowed for model and read-only tool steps; mutating tool steps do not automatically retry absent a future idempotency contract.

# Runtime routing regressions

Preserve exact, discover, recommend, compose, saved Flow execution, and Suite scope. Ordinary failed discovery stays read-only and never becomes create. Dynamic compose is temporary and never implies persistence. One coherent existing Skill workflow is not decomposed merely because it contains multiple stages.

# Repository policy

Mutation modes use non-main branch → write → validate → diff → reviewer. Never write directly to main. PR creation is explicit opt-in. Preserve public/private boundaries, dependency scanning, preflight, stale SHA protection, and v0.9.0 hardening.

# Definition of done

A Flow v2 create is ready for Author only when Registry-first boundary checks are complete, required `model`/`external_tool` dispositions map directly to `model`/`tool` without schema-fitting Skills, all other required primitives are representable, tool effect/security semantics are explicit, handoffs reference declared outputs only, and v1 behavior remains unchanged.
