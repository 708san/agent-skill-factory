---
name: skill-architect
description: Design Registry-first Skill/Flow/Suite changes after mutation authorization, visibility-aware Registry Search, Candidate Skill Inspection, and Reuse Boundary Check; decide reuse, extension, creation, boundaries, contracts, dependent impact, representability, handoffs, and Flow-first architecture.
---

# Mission

Design the smallest coherent Registry change that solves the user's explicit reusable-system intent without creating duplicate Skills, giant Skills, unnecessary micro-Skills, illegal visibility dependencies, breaking explicit non-split boundaries, or unrepresentable Flows.

Architect is not the first step of create. It receives a mutation-oriented request only after the request has been classified, the Creation Gate has authorized persistence, and visibility-aware Registry Search → Candidate Skill Inspection → Reuse Boundary Check → draft Capability Gap Plan have been performed by the orchestrator.

# Required inputs from the Registry-first pipeline

Before architecture, require enough evidence to understand:

- explicit creation/change intent for the mutation being proposed;
- requested reusable outcome;
- target Registry object type and target visibility;
- capability decomposition;
- relevant Skill search results and the public/private scopes searched;
- relevant Flow search results and scopes for multi-capability requests;
- candidate Skills and which candidates were inspected with `getSkill`;
- boundary evidence from inspected SKILL.md files;
- Capability Gap Plan dispositions: `reuse`, `extend`, `create`, `model`, `external_tool`;
- `targetVisibility` and `searchedScopes` evidence for each capability decision;
- `splitJustification` for every proposed `create`;
- existing Skill responsibility/contract details for any persisted existing-Skill change;
- Registry dependents for persisted existing-Skill changes when `getRegistryDependents` is available.

If target visibility is unresolved, if a strong candidate was not inspected, if gap decisions were made from an incomplete visibility scope, or if `create` lacks credible splitJustification, return to the earlier pipeline stage instead of authoring.

# Visibility-aware Registry Search contract

Apply these architecture constraints to the search evidence:

- private target: require search evidence from both private and public Skills, and from both private/public Flows when Flow search is relevant. A private object may reuse either visibility.
- public target: direct reuse evidence comes from public Skills/Flows only. Never design a public object with a private Registry dependency. A private candidate may inform a publisher/public-safe alternative decision, but direct reuse requires public material.
- unresolved target visibility: do not approve architecture or authoring until visibility is explicit and search/gap evidence is sufficient for that visibility.

A Capability Gap Plan must show which Registry scopes support each `reuse`/`extend`/`create` judgment. Do not label a private-only candidate `reuse` for a public target.

# Candidate Skill Inspection contract

For every strong candidate relevant to a proposed new Skill capability, verify that the current SKILL.md was inspected—not just name/description metadata.

Boundary evidence should cover:

- responsibility/scope;
- trigger/non-trigger;
- workflow and supported modes;
- review/diagnostic/revision stages;
- inputs/outputs;
- quality gate;
- failure modes;
- handoff semantics;
- explicit non-split/boundary statements.

A requested capability may already belong to an existing Skill as an internal workflow stage or supported mode. Treat that as ownership evidence, not a gap.

# Reuse Boundary Check — architecture verification

Architect independently verifies the boundary decision before authoring.

## Existing ownership

Treat a capability as already owned when the inspected Skill legitimately contains it as:

- top-level responsibility;
- supported mode;
- workflow/sub-step;
- review or diagnostic stage;
- output variant;
- another explicitly declared part of the same coherent workflow.

Do not create a separate Skill merely because that internal stage has a describable name or output.

If one Skill already owns the entire requested workflow, prefer that Skill alone. Do not create a Flow that simply externalizes its internal stages.

## Partial fit

When an existing Skill's coherent responsibility naturally includes the requested capability but coverage is incomplete, evaluate `extend` before `create`.

For persisted extension:

1. inspect responsibility, trigger/non-trigger, workflow, inputs/outputs, quality gate, failure modes, and handoff;
2. inspect dependents when available (public Skill: public + private; private Skill: private);
3. identify backward-compatibility obligations;
4. allow extend only when the existing contract remains compatible.

## Independent responsibility test

Approve `create` only when the proposed Skill has:

- an independent user goal;
- an independently useful output;
- independent reuse value in other workflows;
- a boundary that is not merely an existing Skill's implementation/sub-step.

`splitJustification` must explicitly explain why these conditions hold and why strong inspected candidates do not already own the capability.

## Explicit non-split rule

An explicit candidate boundary such as `do not split`, `keep review and revision in one workflow`, or `X is part of this responsibility` is authoritative for ordinary create. If the proposed design would violate it, stop and route to explicit refactor/split rather than silently creating a new Skill.

# Capability placement decisions

For every required capability, confirm or revise one primary disposition:

- `reuse` — an existing Skill adequately owns the responsibility, is visible/legal for the target, and can be used unchanged;
- `extend` — an existing Skill can be generalized/improved backward-compatibly while preserving its responsibility and contract;
- `create` — no existing legal Skill owns the independently reusable responsibility;
- `model` — ordinary model reasoning/generation is sufficient and should not become Registry code;
- `external_tool` — external state/action/API belongs to a tool integration rather than a Skill.

Do not treat `create` as the default. Architecture quality includes minimizing persistent Registry growth while preserving responsibility and visibility boundaries.

# Capability Gap Plan contract

Every capability must include:

- `capability`;
- `disposition`;
- `candidateSkills`;
- `inspectedCandidates`;
- `boundaryDecision`;
- `supportingEvidence`;
- `splitJustification` for create;
- `targetVisibility`;
- `searchedScopes`.

Architect rejects `create` when inspected-candidate evidence is missing or splitJustification does not prove independent responsibility.

# Extension and dependent safety

For every persisted change to an existing Skill, including an `extend` candidate:

1. inspect the existing Skill's responsibility, trigger/non-trigger semantics, workflow, inputs, outputs, quality gate, handoff contract, and failure modes;
2. when `getRegistryDependents` is available, dependent-impact inspection is mandatory before approving the persisted change;
3. for a public Skill, inspect both public dependents and private dependents by querying the explicitly selected public and private dependent Registry scopes/refs;
4. for a private Skill, inspect private dependents in the explicitly selected private Registry scope/ref;
5. identify which dependent contracts could observe the proposed change;
6. use dependent evidence to judge backward compatibility and migration risk—the existence of dependents alone neither approves nor blocks the extension;
7. allow extension only when the proposed behavior remains within the same coherent responsibility and preserves existing contract semantics;
8. if the proposed capability is independently reusable or introduces a separate user intent/output, design a separate Skill;
9. if the change would alter/break existing meaning or contract, classify it as `refactor` and require explicit refactor scope rather than silently changing the Skill inside create.

# Required decisions before authoring

For every create, split, merge, or boundary-changing refactor, decide:

1. whether a Registry object is needed at all;
2. target visibility and whether search evidence covers the required legal Registry scopes;
3. whether strong existing Skill candidates were inspected deeply enough to resolve ownership boundaries;
4. whether each capability is `reuse`, `extend`, `create`, `model`, or `external_tool`;
5. whether every create has credible splitJustification;
6. whether the reusable object is one Skill, multiple Skills, a Flow + Skills, or a Suite relationship;
7. the boundary among Skill / reference / script / asset / eval / external tool or API;
8. trigger and non-trigger conditions;
9. inputs;
10. outputs;
11. quality gate;
12. handoff contract;
13. failure modes;
14. reuse potential;
15. compatibility and dependent impact for every persisted existing-Skill change;
16. for Flow designs, whether every required step is representable by current Flow v1.

Do not begin authoring until these decisions are sufficiently clear.

# Flow-first multi-capability creation

When the user explicitly requests a reusable multi-capability process or “仕組み”:

- single coherent reusable responsibility → one Skill;
- reusable known multi-capability process → Flow + independently reusable Skills;
- temporary multi-Skill task execution → dynamic compose, not a persisted Flow.

For Flow + Skills:

1. apply Reuse Boundary Check first so one existing Skill's coherent internal workflow is not decomposed;
2. search and reuse existing Skills wherever legally possible for the target visibility;
3. create only genuine independently reusable capability gaps;
4. keep independently reusable responsibilities as separate Skills;
5. keep orchestration, DAG dependencies, handoffs, conditions, and completion semantics in the Flow;
6. do not duplicate Skill implementation logic into Flow manifests;
7. do not create a giant Skill simply because all steps contribute to one business outcome.

If all necessary independent Skills already exist and only reusable orchestration is missing, create only the Flow. If one existing Skill already owns the whole coherent workflow, reuse it without a Flow. If a matching existing Flow already satisfies the process, prefer reuse and create nothing.

# Flow v1 representability guard

Current Flow schema/runtime v1 supports only:

- `exact_skill`: pinned Skill reference;
- `capability`: a capability query resolved through Skill discovery.

Neither type directly represents model-native execution or an external tool/API action.

For each required Flow capability:

1. start from the Capability Gap Plan disposition;
2. if `reuse`/`extend`/`create` yields a legal independently justified Skill, represent it with `exact_skill` or `capability` as appropriate;
3. if the required capability remains `model` or `external_tool`, ask whether current Flow v1 has a legal Skill-based representation without distorting responsibility;
4. if not, mark `unsupported_flow_capability` and stop the Flow architecture before Author.

`unsupported_flow_capability` is blocking for that Flow design. Do not silently remove/make optional a required capability, create a model-native Skill solely to satisfy Flow schema, hide external-tool responsibility inside a Skill solely to satisfy Flow schema, or emit unsupported step types.

# Boundary rules

Use these heuristics:

- independent user intent + independent output + independently reusable responsibility → separate Skill candidate;
- supported mode/workflow/review/diagnostic stage inside a coherent existing responsibility → reuse existing Skill;
- conditionally needed knowledge inside one responsibility → reference;
- deterministic repeated computation, validation, format checking, or static analysis → script;
- template, image, reusable source material, or reference visual → asset;
- external state, current data, or external action → external tool/API;
- examples and regression behavior → eval.

Multiple workflow steps alone do not justify multiple Skills. If the steps form one natural responsibility, keep them together. Example: review → rewrite can remain one `human-writing-review` Skill.

# Skill Contract

A reusable Skill design should make these explicit without bloating frontmatter:

- responsibility
- trigger
- non-trigger
- inputs
- outputs
- quality gate
- `handoff_in`
- `handoff_out`
- failure modes

Keep Skills loosely coupled. A downstream Skill should depend on an input contract, not on a specific upstream Skill name.

# Composition design

Dynamic compose is an execution mechanism, not a build trigger. It may be used for ordinary temporary multi-Skill tasks without persisting a Flow.

When several Skills may be needed in an explicitly reusable design:

- identify independently reusable responsibilities;
- define required and optional handoff fields;
- mark dependencies versus parallelizable work;
- prefer the minimum Skill set;
- avoid fixed chains when runtime discovery is intentionally desired;
- preserve user stop points and explicit ordering.

# Flow design

A v1 Flow is a standalone Registry object under `flows/<flow-name>/FLOW.json` and is a DAG. Each step expresses id, target type, dependencies, required/optional status, limited declarative condition, input handoff, and expected output.

Support exactly the currently validated step semantics:

- `exact_skill`: a pinned Skill reference that runtime must not silently substitute;
- `capability`: a capability query that runtime may resolve dynamically through Skill discovery.

Do not allow Flow → Flow recursion in v1. Conditions remain declarative equality checks under `condition.when`; do not introduce eval, JavaScript, arbitrary expressions, natural-language condition execution, model-native steps, or external-tool steps in v1.

# Suite design

A Suite is a standalone non-owning relationship object under `suites/<suite-name>/SUITE.json`. It may reference member Skills/Flows and optional shared policies, quality gates, or artifact-contract references. The same Skill/Flow may appear in multiple Suites.

Suite policy applies only when the Suite/Flow context is explicitly active. It must not modify standalone member Skill behavior.

# Package architecture

The canonical Skill root is always `skills/<skill-name>/` with required `SKILL.md` and optional `references/`, `scripts/`, `assets/`, `evals/` when justified.

Additional first-class Registry roots are:

- `flows/<flow-name>/FLOW.json` with optional `evals/`;
- `suites/<suite-name>/SUITE.json` with optional `evals/`.

Do not move Skills or Flows beneath Suites.

# Visibility

Public Flow/Suite objects may reference only public Registry objects. Private Flow/Suite objects may explicitly reference public or private Registry objects. Never expose private Registry names or repository details through a public manifest.

Registry Search, reuse, extension, and Flow design must preserve the same boundary. Private target searches both scopes and may reuse both. Public direct dependencies remain public-only; private source material requires a publisher/public-safe path rather than direct reference.

# Progressive Disclosure

Load only evidence needed for the current architecture decision: target visibility → search results → strong candidate SKILL.md boundary evidence → Reuse Boundary Check → gap plan → contracts/dependents for extend/refactor candidates → representability evidence for Flow → detailed references only when required.

# Definition of done

Architecture is ready for authoring when:

- mutation authorization and explicit creation/change intent have been established upstream;
- target visibility is explicit;
- Registry Search covered the scopes required for that target and multi-capability requests searched relevant Flows;
- strong candidate Skills were inspected with current SKILL.md before create decisions;
- Reuse Boundary Check established whether requested capabilities are existing workflow/sub-responsibilities, partial fits, or independent responsibilities;
- every capability records candidateSkills, inspectedCandidates, boundaryDecision, supportingEvidence, searched scopes, and disposition;
- every create has credible splitJustification proving independent user goal/output/reuse and non-sub-step boundary;
- no blind duplicate Skill creation or illegal public→private dependency remains;
- every persisted existing-Skill change inspected its contract and all required dependent scopes when available;
- explicit non-split boundaries are preserved or handled as explicit refactor/split;
- Flow-first design did not decompose one coherent existing Skill workflow;
- every required Flow step is representable by Flow v1; otherwise `unsupported_flow_capability` blocks Author;
- inputs/outputs/quality gates/handoffs/failure modes are clear;
- public/private boundaries remain safe.
