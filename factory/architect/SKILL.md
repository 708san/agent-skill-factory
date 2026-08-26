---
name: skill-architect
description: Design Registry-first Skill/Flow/Suite changes after mutation authorization and visibility-aware Registry gap analysis; decide reuse, extension, creation, model/tool placement, boundaries, contracts, dependent impact, representability, handoffs, and Flow-first architecture.
---

# Mission

Design the smallest coherent Registry change that solves the user's explicit reusable-system intent without creating duplicate Skills, giant Skills, unnecessary micro-Skills, illegal visibility dependencies, or unrepresentable Flows.

Architect is not the first step of create. It receives a mutation-oriented request only after the request has been classified, the Creation Gate has authorized persistence, and visibility-aware Registry Search + Capability Gap Plan have been performed by the orchestrator.

# Required inputs from the Registry-first pipeline

Before architecture, require enough evidence to understand:

- explicit creation/change intent for the mutation being proposed;
- requested reusable outcome;
- target Registry object type and target visibility;
- capability decomposition;
- relevant Skill search results and the public/private scopes searched;
- relevant Flow search results and scopes for multi-capability requests;
- Capability Gap Plan dispositions: `reuse`, `extend`, `create`, `model`, `external_tool`;
- `targetVisibility` and `searchedScopes` evidence for each capability decision;
- existing Skill responsibility/contract details for any persisted existing-Skill change;
- Registry dependents for persisted existing-Skill changes when `getRegistryDependents` is available.

If target visibility is unresolved, or gap decisions were made from an incomplete visibility scope, return to Registry Search before authoring. If other evidence is materially missing, return to Registry Search/Gap planning or dependent-impact inspection instead of defaulting to new Skill authoring.

# Visibility-aware Registry Search contract

Apply these architecture constraints to the search evidence:

- private target: require search evidence from both private and public Skills, and from both private/public Flows when Flow search is relevant. A private object may reuse either visibility.
- public target: direct reuse evidence comes from public Skills/Flows only. Never design a public object with a private Registry dependency. A private candidate may inform a publisher/public-safe alternative decision, but direct reuse requires public material.
- unresolved target visibility: do not approve architecture or authoring until visibility is explicit and search/gap evidence is sufficient for that visibility.

A Capability Gap Plan must show which Registry scopes support each `reuse`/`extend`/`create` judgment. Do not label a private-only candidate `reuse` for a public target.

# Capability placement decisions

For every required capability, confirm or revise one primary disposition:

- `reuse` — an existing Skill adequately owns the responsibility, is visible/legal for the target, and can be used unchanged;
- `extend` — an existing Skill can be generalized/improved backward-compatibly while preserving its responsibility and contract;
- `create` — no existing legal Skill adequately owns a reusable responsibility, so a new Skill is justified;
- `model` — ordinary model reasoning/generation is sufficient and should not become Registry code;
- `external_tool` — external state/action/API belongs to a tool integration rather than a Skill.

Do not treat `create` as the default. Architecture quality includes minimizing persistent Registry growth while preserving visibility boundaries.

# Extension and dependent safety

For every persisted change to an existing Skill, including an `extend` candidate:

1. inspect the existing Skill's responsibility, trigger/non-trigger semantics, inputs, outputs, quality gate, handoff contract, and failure modes;
2. when `getRegistryDependents` is available, dependent-impact inspection is mandatory before approving the persisted change;
3. for a public Skill, inspect both public dependents and private dependents by querying the explicitly selected public and private dependent Registry scopes/refs;
4. for a private Skill, inspect private dependents in the explicitly selected private Registry scope/ref;
5. identify which dependent contracts could observe the proposed change;
6. use the dependent evidence to judge backward compatibility and migration risk—the existence of dependents alone neither approves nor blocks the extension;
7. allow extension only when the proposed behavior remains within the same coherent responsibility and preserves existing contract semantics;
8. if the proposed capability is independently reusable or introduces a separate user intent/output, design a separate Skill;
9. if the change would alter/break existing meaning or contract, classify it as `refactor` and require explicit refactor scope rather than silently changing the Skill inside create.

# Required decisions before authoring

For every create, split, merge, or boundary-changing refactor, decide:

1. whether a Registry object is needed at all;
2. target visibility and whether search evidence covers the required legal Registry scopes;
3. whether each capability is `reuse`, `extend`, `create`, `model`, or `external_tool`;
4. whether the reusable object is one Skill, multiple Skills, a Flow + Skills, or a Suite relationship;
5. the boundary among Skill / reference / script / asset / eval / external tool or API;
6. trigger and non-trigger conditions;
7. inputs;
8. outputs;
9. quality gate;
10. handoff contract;
11. failure modes;
12. reuse potential;
13. compatibility and dependent impact for every persisted existing-Skill change;
14. for Flow designs, whether every required step is representable by current Flow v1.

Do not begin authoring until these decisions are sufficiently clear.

# Flow-first multi-capability creation

When the user explicitly requests a reusable multi-capability process or “仕組み”:

- single coherent reusable responsibility → one Skill;
- reusable known multi-capability process → Flow + independently reusable Skills;
- temporary multi-Skill task execution → dynamic compose, not a persisted Flow.

For Flow + Skills:

1. search and reuse existing Skills wherever legally possible for the target visibility;
2. create only genuine independently reusable capability gaps;
3. keep independently reusable responsibilities as separate Skills;
4. keep orchestration, DAG dependencies, handoffs, conditions, and completion semantics in the Flow;
5. do not duplicate Skill implementation logic into Flow manifests;
6. do not create a giant Skill simply because all steps contribute to one business outcome.

If all necessary Skills already exist and only reusable orchestration is missing, create only the Flow. If a matching existing Flow already satisfies the process, prefer reuse and create nothing.

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

`unsupported_flow_capability` is blocking for that Flow design. Do not:

- silently remove or make optional a required capability merely to validate;
- convert a model-native capability into a new Skill solely to satisfy Flow schema;
- hide an external-tool/API responsibility inside a Skill solely to satisfy Flow schema;
- emit any unsupported Flow step type.

Architect may propose a non-Flow alternative, a reduced explicitly user-approved scope, or a future Factory/runtime extension, but must not pass an unrepresentable Flow to Author.

# Boundary rules

Use these heuristics:

- independent user intent + independent output + independently reusable responsibility → separate Skill candidate;
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

Load only evidence needed for the current architecture decision: target visibility → search-scope/gap-plan summary → promising Registry objects → contracts/dependents for extend/refactor candidates → representability evidence for Flow → detailed references only when required.

# Definition of done

Architecture is ready for authoring when:

- mutation authorization and explicit creation/change intent have been established upstream;
- target visibility is explicit;
- Registry Search covered the scopes required for that target (private target: public + private; public direct reuse: public); multi-capability requests also searched relevant Flows;
- every capability records searched scope evidence and has a justified `reuse`/`extend`/`create`/`model`/`external_tool` disposition;
- no blind duplicate Skill creation or illegal public→private dependency remains;
- every persisted existing-Skill change inspected its contract and, when available, all required dependent scopes (public target: public + private; private target: private);
- dependent evidence informed backward-compatibility judgment rather than acting as an automatic veto;
- extension preserves responsibility/contract or has been escalated to explicit refactor;
- Flow-first design was considered for reusable multi-capability processes;
- only genuine missing capabilities become new Skills;
- every required Flow step is representable by Flow v1; otherwise `unsupported_flow_capability` blocks Author;
- inputs/outputs/quality gates/handoffs/failure modes are clear;
- public/private boundaries remain safe.
