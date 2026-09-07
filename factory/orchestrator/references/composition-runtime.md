# Multi-Skill Composition Runtime

Load this reference only after the orchestrator has decided that multiple Skills are necessary or the user explicitly requested multiple Skills.

## Minimal composition rule

Select the smallest Skill set that can complete the user goal at the requested quality level. Do not add Skills because they are merely relevant or available.

Do not compose when:

- one Skill's core workflow naturally completes the task;
- the task simply has multiple steps;
- normal model judgment is sufficient between Skill steps;
- splitting creates handoff cost without a meaningful quality or reuse gain.

## Skill Execution Plan

Maintain an internal plan with these fields:

- `user_goal`
- `selected_skills`
- `execution_order`
- `responsibilities`
- `inputs`
- `expected_outputs`
- `handoffs`
- `dependencies`
- `completion_condition`

The plan need not be shown verbatim to the user.

## Selection

1. Search the Registry instead of assuming a fixed chain.
2. Evaluate each candidate's responsibility, trigger/non-trigger, inputs, outputs, quality gate, and constraints.
3. Remove candidates that are redundant or not necessary for completion.
4. Respect explicit exclusions and stopping points from the user.

## Sequential handoff

For each dependent pair, record:

- upstream Skill
- downstream Skill
- transferred information or artifact
- assumptions
- unresolved items

Pass only the information needed by the downstream contract. Do not dump the upstream Skill's full instructions, references, or irrelevant intermediate material into the next Skill.

Example handoff:

`creative-theme-planning` output:

- target
- problem
- key value
- CTA
- visual direction

`visual-composition` input:

- target
- key value
- CTA
- visual direction

## Parallelizable work

Mark dependencies explicitly. If two Skills have no dependency, they are logically parallelizable. If the available runtime executes sequentially, preserve the logical independence without pretending true parallel execution occurred.

## Replanning

Update the plan when:

- a selected Skill is unsuitable;
- a required Skill is missing;
- upstream output differs materially from expectation;
- a planned downstream Skill becomes unnecessary;
- an additional responsibility becomes necessary.

After replanning, re-apply the minimal composition rule. Do not let the chain grow without bound.

## Failure handling

When a Skill cannot provide required output:

1. determine whether corrected input to the same Skill can solve it;
2. supplement or repair the upstream handoff when possible;
3. search for a replacement Skill only if needed;
4. ask the user for missing information when the requirement cannot otherwise be satisfied.

Never execute a downstream Skill when its required input is missing or invalid.

## Public/private composition

Public and private Skills may be combined in read-only use mode. Keep visibility explicit per Skill. Never write private Skill content, references, or derived private repository material into the public repository unless the publisher workflow explicitly sanitizes it.

## Completion

Composition is complete when the user's requested final output is produced, each required handoff was satisfied, unnecessary planned Skills were skipped, and no user stop/exclusion constraint was violated.

## Saved Flow v2 execution addendum

For `schema_version: 2`, saved Flow execution adds `model` and `tool` to the existing `exact_skill` / `capability` semantics. Preserve the existing DAG, `required`, `depends_on`, declarative `condition.when`, `input_handoff`, `expected_output`, and `completion.required_steps=all_required` contracts. Handoff sources remain only `flow.<input>` and `steps.<step-id>.<output>`.

A `model` step resolves its handoff inputs, follows its manifest instruction, and executes with the current host/runtime LLM only. It must not call web search, APIs, connectors, plugins, or obtain current external state. Normalize only fields declared in `expected_output`; missing required output is `STEP_OUTPUT_INVALID`.

A `tool` step resolves exact or capability binding. Exact binding never silently substitutes; missing exact tool is `TOOL_UNAVAILABLE`. Capability binding may choose an available matching runtime tool; no match is `TOOL_UNAVAILABLE`. Before execution, enforce the manifest `effect` as a maximum allowed effect and then apply normal platform/tool authorization, user confirmation, and safety. `read_only` blocks mutating or unknown-effect tools; `mutating` grants no bypass. Pass manifest arguments plus resolved handoffs and never invent missing output fields.

Runtime failure codes include `SKILL_NOT_FOUND`, `TOOL_UNAVAILABLE`, `TOOL_AUTH_DENIED`, `MODEL_UNAVAILABLE`, `STEP_TIMEOUT`, and `STEP_OUTPUT_INVALID`. Any applicable required-step failure prevents full success. Limited transient retries are allowed for model and read-only tool steps; mutating tool steps are not automatically retried absent a future idempotency contract.
