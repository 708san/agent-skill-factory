---
name: skill-architect
description: Decide whether a capability should be a Skill, how many Skills are needed, and how responsibility, contracts, package resources, handoffs, tools, and reuse boundaries should be designed before implementation.
---

# Mission

Design the smallest coherent Skill architecture that solves the user's intent without creating a giant Skill or unnecessary micro-Skills.

Flow and Suite are additional Registry placement choices; they do not weaken the Skill architecture rules below.

# Required decisions before authoring

For every create, split, merge, or boundary-changing refactor, decide:

1. whether a Skill is needed at all;
2. whether the capability is one Skill or multiple Skills;
3. the boundary among Skill / reference / script / asset / eval / external tool or API;
4. trigger and non-trigger conditions;
5. inputs;
6. outputs;
7. quality gate;
8. handoff contract;
9. failure modes;
10. reuse potential.

Do not begin authoring until these decisions are sufficiently clear.

For Registry-wide design, first classify whether the reusable object is a Skill, Flow, or Suite. If it is a Skill, retain the complete checklist above. A reusable known multi-Skill execution plan is a Flow; a related capability family/discovery scope is a Suite.

# Boundary rules

Use these heuristics:

- independent user intent + independent output + independently reusable responsibility → separate Skill candidate;
- conditionally needed knowledge inside one responsibility → reference;
- deterministic repeated computation, validation, format checking, or static analysis → script;
- template, image, reusable source material, or reference visual → asset;
- external state, current data, or external action → external tool/API;
- examples and regression behavior → eval.

Multiple workflow steps alone do not justify multiple Skills. If the steps form one natural responsibility, keep them together. Example: review → rewrite can remain one `human-writing-review` Skill.

Load `references/capability-placement.md` and `references/boundary-rules.md` when placement or split/merge decisions are non-trivial. Load `references/skill-contract.md` when a Skill may participate in multi-Skill composition or its input/output boundary is unclear.

For Registry placement, also use these rules:

- independent reusable capability → Skill;
- reusable known multi-Skill execution plan → Flow;
- related Skill/Flow capability family, discovery scope, and optional context policy → Suite.

Keep Skill implementation details, prompts, and How in the Skill itself rather than duplicating them into a Flow.

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

Example: `visual-composition` may require target audience, message, CTA, and visual constraints. It should not require that those values came from `ad-concept-planning`.

# Composition design

When several Skills may be needed:

- identify which responsibilities are independently reusable;
- define required and optional handoff fields;
- mark dependencies versus logically parallelizable work;
- prefer the minimum Skill set needed for the end goal;
- avoid fixed chains when Registry discovery can select suitable Skills dynamically;
- preserve user stop points and explicit Skill ordering.

Saved Flows complement rather than replace this dynamic composition design: use a Flow only when the execution plan itself is known, intentionally designed, and reusable. Capability steps may retain runtime discovery for selected parts of a fixed Flow skeleton.

# Flow design

A v1 Flow is a standalone Registry object under `flows/<flow-name>/FLOW.json` and is a DAG. Each step expresses target type, dependencies, required/optional status, limited declarative condition, input handoff, and expected output.

Support at least:

- `exact_skill`: a pinned Skill reference that runtime must not silently substitute;
- `capability`: a capability query that runtime may resolve dynamically.

Do not allow Flow → Flow recursion in v1. Keep the tagged step model extensible so a future subflow type can be introduced deliberately. Conditions must remain declarative equality checks under `condition.when`; do not introduce eval, JavaScript, arbitrary expressions, or natural-language condition execution.

Prefer current Skill contracts over commit-SHA pinning. Do not introduce a separate versioning subsystem unless a machine-readable Skill contract makes lightweight compatibility requirements necessary.

# Suite design

A Suite is a standalone non-owning relationship object under `suites/<suite-name>/SUITE.json`. It may reference member Skills/Flows and optional shared policies, quality gates, or artifact-contract references. The same Skill/Flow may appear in multiple Suites.

Suite policy applies only when the Suite/Flow context is explicitly active. It must not modify standalone member Skill behavior.

# Package architecture

Design the Skill package before authoring prose. The canonical root is always:

`skills/<skill-name>/`

Required:

- `skills/<skill-name>/SKILL.md`

Optional when justified:

- `references/`
- `scripts/`
- `assets/`
- `evals/`

Do not design a root-level `<skill-name>/SKILL.md` package.

Additional first-class Registry roots are:

- `flows/<flow-name>/FLOW.json` with optional `evals/`;
- `suites/<suite-name>/SUITE.json` with optional `evals/`.

Do not move Skills or Flows beneath Suites. Use JSON for Flow/Suite v1 manifests and native parsing/validation unless a concrete need justifies another dependency.

# Visibility

Public Flow/Suite objects may reference only public Registry objects. Private Flow/Suite objects may explicitly reference public or private Registry objects. Never expose private Registry names or repository details through a public manifest.

# Progressive Disclosure

Keep core execution rules in SKILL.md. Move detailed or conditional material out when it does not need to be loaded every run. Do not move essential decision rules so far out that basic execution requires loading every reference.

# Definition of done

Architecture is ready for authoring when:

- the need for a Skill is justified;
- one-vs-many Skill boundaries are explicit;
- package resources are allocated intentionally;
- inputs/outputs/quality gate and handoff are clear;
- failure modes and non-triggers are defined;
- the design supports reuse without unnecessary coupling.

For Flow/Suite work, also require correct object placement, non-owning references, explicit DAG/handoff/completion semantics, safe visibility, and no degradation of standalone Skill reuse, Skill discovery, or dynamic compose.
