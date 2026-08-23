---
name: skill-architect
description: Design Registry-first Skill/Flow/Suite changes after creation intent and Registry gap analysis; decide reuse, extension, creation, model/tool placement, boundaries, contracts, handoffs, and Flow-first multi-capability architecture.
---

# Mission

Design the smallest coherent Registry change that solves the user's explicit reusable-system intent without creating duplicate Skills, giant Skills, unnecessary micro-Skills, or breaking existing contracts.

Architect is not the first step of create. It receives a request only after the Creation Gate passes and Registry Search + Capability Gap Plan have been performed by the orchestrator.

# Required inputs from the Registry-first pipeline

Before architecture, require enough evidence to understand:

- explicit creation/change intent;
- requested reusable outcome;
- capability decomposition;
- relevant Skill search results;
- relevant Flow search results for multi-capability requests;
- Capability Gap Plan dispositions: `reuse`, `extend`, `create`, `model`, `external_tool`;
- existing Skill responsibility/contract details for any `extend` candidate;
- Registry dependents when available and relevant to extension/refactor risk.

If these are materially missing, return to Registry Search/Gap planning instead of defaulting to new Skill authoring.

# Capability placement decisions

For every required capability, confirm or revise one primary disposition:

- `reuse` — an existing Skill adequately owns the responsibility and can be used unchanged;
- `extend` — an existing Skill can be generalized/improved backward-compatibly while preserving its responsibility and contract;
- `create` — no existing Skill adequately owns a reusable responsibility, so a new Skill is justified;
- `model` — ordinary model reasoning/generation is sufficient and should not become Registry code;
- `external_tool` — external state/action/API belongs to a tool integration rather than a Skill.

Do not treat `create` as the default. Architecture quality includes minimizing persistent Registry growth.

# Extension safety

For every `extend` candidate:

1. inspect the existing Skill's responsibility, trigger/non-trigger semantics, inputs, outputs, quality gate, handoff contract, and failure modes;
2. inspect dependents with `getRegistryDependents` when available;
3. identify backward-compatibility obligations;
4. allow extension only when the proposed behavior remains within the same coherent responsibility;
5. if the proposed capability is independently reusable or introduces a separate user intent/output, design a separate Skill;
6. if the change would alter/break existing meaning or contract, classify it as `refactor` and require explicit refactor scope rather than silently changing the Skill inside create.

# Required decisions before authoring

For every create, split, merge, or boundary-changing refactor, decide:

1. whether a Registry object is needed at all;
2. whether the capability is `reuse`, `extend`, `create`, `model`, or `external_tool`;
3. whether the reusable object is one Skill, multiple Skills, a Flow + Skills, or a Suite relationship;
4. the boundary among Skill / reference / script / asset / eval / external tool or API;
5. trigger and non-trigger conditions;
6. inputs;
7. outputs;
8. quality gate;
9. handoff contract;
10. failure modes;
11. reuse potential;
12. compatibility/dependent impact for extensions.

Do not begin authoring until these decisions are sufficiently clear.

# Flow-first multi-capability creation

When the user explicitly requests a reusable multi-capability process or “仕組み”:

- single coherent reusable responsibility → one Skill;
- reusable known multi-capability process → Flow + independently reusable Skills;
- temporary multi-Skill task execution → dynamic compose, not a persisted Flow.

For Flow + Skills:

1. search and reuse existing Skills wherever possible;
2. create only the capability gaps;
3. keep independently reusable responsibilities as separate Skills;
4. keep orchestration, DAG dependencies, handoffs, conditions, and completion semantics in the Flow;
5. do not duplicate Skill implementation logic into Flow manifests;
6. do not create a giant Skill simply because all steps contribute to one business outcome.

If all necessary Skills already exist and only reusable orchestration is missing, create only the Flow. If a matching existing Flow already satisfies the process, prefer reuse and create nothing.

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

A v1 Flow is a standalone Registry object under `flows/<flow-name>/FLOW.json` and is a DAG. Each step expresses target type, dependencies, required/optional status, limited declarative condition, input handoff, and expected output.

Support at least:

- `exact_skill`: a pinned Skill reference that runtime must not silently substitute;
- `capability`: a capability query that runtime may resolve dynamically.

Do not allow Flow → Flow recursion in v1. Conditions remain declarative equality checks under `condition.when`; do not introduce eval, JavaScript, arbitrary expressions, or natural-language condition execution.

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

Registry Search, reuse, extension, and Flow design must preserve the same boundary; reuse never grants permission to leak private content into public manifests.

# Progressive Disclosure

Load only evidence needed for the current architecture decision: gap-plan summary → promising Registry objects → contracts/dependents for extend/refactor candidates → detailed references only when required.

# Definition of done

Architecture is ready for authoring when:

- explicit creation/change intent has been established upstream;
- Registry Search covered relevant Skills and, for multi-capability reusable requests, relevant Flows;
- every required capability has a justified `reuse`/`extend`/`create`/`model`/`external_tool` disposition;
- no blind duplicate Skill creation remains;
- extension preserves responsibility/contract or has been escalated to explicit refactor;
- Flow-first design was considered for reusable multi-capability processes;
- only genuine missing capabilities become new Skills;
- inputs/outputs/quality gates/handoffs/failure modes are clear;
- public/private boundaries remain safe.
