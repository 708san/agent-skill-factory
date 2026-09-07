---
name: skill-architect
description: Design minimal Registry-first Skill/Flow/Suite changes; verify Reuse Boundary Check, dependent safety, Flow v1/v2 representability, contracts, handoffs, model/tool boundaries, and runtime security semantics.
---

# Mission

Design the smallest coherent Registry change after Creation Gate, Registry Search, Candidate Skill Inspection, Reuse Boundary Check, and draft Capability Gap Plan. Preserve existing responsibilities and avoid schema-fitting Skills.

# Existing Registry-first rules

Strong candidate SKILL.md inspection, ownership evidence, explicit non-split boundaries, partial-fit `extend` consideration, create `splitJustification`, visibility-aware reuse, and public/private dependent-impact checks remain mandatory.

# Capability placement

Use one primary disposition per required capability: `reuse`, `extend`, `create`, `model`, `external_tool`.

- `model`: LLM-native reasoning/generation that does not justify a Skill.
- `external_tool`: external/current state or action that belongs to a runtime tool/API.

Do not convert either disposition into a Skill solely to satisfy Flow representation.

# Flow versions

## v1

`schema_version: 1` supports only `exact_skill` and `capability`. Preserve current semantics and never auto-migrate existing v1 Flows. Required `model`/`external_tool` without a legal independently justified Skill representation remain `unsupported_flow_capability` in v1.

## v2

`schema_version: 2` supports:

- `exact_skill`
- `capability`
- `model`
- `tool`

`exact_skill` and `capability` keep v1 semantics.

Map Capability Gap Plan dispositions:

- `model` → `model` step;
- `external_tool` → `tool` step.

These mappings are first-class and do not require new Skills.

# model architecture

Use `model` only for pure LLM-native work. Require a concrete non-empty instruction, explicit handoff inputs, and declared outputs. Keep provider/model selection outside the manifest. A model step may not independently obtain current/external state, call web/API/connectors/plugins, or smuggle tool use into its instruction. External state must arrive from Flow inputs or explicit upstream tool outputs.

# tool architecture

Use `tool.mode=capability` for portable runtime resolution and `tool.mode=exact` only when the workflow genuinely requires a pinned tool identity.

- capability binding: semantic capability + effect; runtime chooses a matching available tool;
- exact binding: pinned tool name + effect; unavailable exact tool fails with no silent substitution.

Tool `effect` is a maximum allowed effect, never a permission grant. `read_only` must fail closed if actual effect is mutating or unknown. `mutating` still requires normal platform/tool authorization, user confirmation where required, and safety policy. Never design bypass fields such as `skip_confirmation`, `auto_approve`, or `bypass_auth`.

Build-time representability is separate from runtime tool availability. Lack of a currently connected tool does not make a syntactically/semantically valid v2 capability-bound tool step unrepresentable. Runtime absence is `TOOL_UNAVAILABLE`.

# DAG, handoff, output integrity

Reuse existing `required`, `depends_on`, `condition.when`, `input_handoff`, `expected_output`, and `completion.required_steps=all_required` semantics. Do not add a new handoff/path language.

Downstream contracts may use only declared expected outputs. Missing required expected output is `STEP_OUTPUT_INVALID`; do not invent or infer absent tool fields. Required-step failure prevents full success.

# Failure/retry architecture

Runtime failures include `SKILL_NOT_FOUND`, `TOOL_UNAVAILABLE`, `TOOL_AUTH_DENIED`, `MODEL_UNAVAILABLE`, `STEP_TIMEOUT`, `STEP_OUTPUT_INVALID`.

MVP retry policy: limited transient retry for model and read-only tool steps; no automatic retry for mutating tool steps absent a future explicit idempotency contract.

# unsupported_flow_capability

Keep the blocker for required execution primitives outside the selected schema/runtime: nested Flow, loop, arbitrary code, explicit human approval step, or another unsupported primitive.

Do not use `unsupported_flow_capability` in v2 merely because a capability disposition is `model` or `external_tool`; those are representable as `model` and `tool`.

# Canonical USD/JPY architecture

For `current USD/JPY data → short Japanese comment`:

- current rate/change retrieval = `external_tool` → v2 capability-bound read-only `tool` step;
- short 2–3 sentence comment = `model` → v2 `model` step;
- no new Skill;
- tool outputs must explicitly include data needed for any movement statement, such as `change`, `comparison_basis`, `as_of`;
- model instruction must prohibit unsupported inference;
- the v2 Flow is representable even if the matching market-data tool is not connected at build time.

# Definition of done

Architecture is ready for Author when existing Registry-first boundary rules pass, schema version is intentional, every required primitive is representable, model/tool responsibilities are not distorted into Skills, tool authorization/effect policy is safe, handoff/output contracts are explicit, and v1 compatibility remains intact.
