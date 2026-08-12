---
name: skill-architect
description: Decide whether a capability should be a Skill, how many Skills are needed, and how responsibility, contracts, package resources, handoffs, tools, and reuse boundaries should be designed before implementation.
---

# Mission

Design the smallest coherent Skill architecture that solves the user's intent without creating a giant Skill or unnecessary micro-Skills.

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
