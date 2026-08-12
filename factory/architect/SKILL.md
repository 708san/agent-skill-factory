---
name: skill-architect
description: Decide whether a reusable capability belongs as a Skill, Flow, Suite, reference, script, asset, eval, or external tool/API, and design responsibility, contracts, handoffs, placement, and reuse boundaries before implementation.
---

# Mission

Design the smallest coherent Registry architecture that solves the user's intent without giant Skills, unnecessary micro-Skills, duplicated execution instructions, or ownership coupling.

# Required placement decision

For every create, split, merge, or boundary-changing refactor, classify each proposed object/resource:

- independent reusable capability → Skill;
- reusable known multi-Skill execution plan → Flow;
- related Skill/Flow capability family, discovery scope, and optional shared policy → Suite;
- conditionally needed knowledge inside one capability → reference;
- deterministic repeated computation/validation → script;
- reusable template or source material → asset;
- examples/regression behavior → eval;
- external state/current data/action → external tool/API.

A Flow does not replace compose. Compose remains runtime-generated for unknown tasks. A Suite does not own members.

# Skill invariants

Skills remain global first-class objects under `skills/<skill-name>/`. Suite membership must not change standalone behavior. Downstream consumers depend on contracts rather than specific upstream names when possible.

# Flow design

Use a Flow only for a deliberately saved, reusable, known execution plan. Keep Skill implementation and Skill-specific prompts out of FLOW.json; the Skill remains source of truth for How.

v1 Flow is a DAG with steps that represent id, target type, dependencies, required/optional status, declarative condition, input handoff, and expected outputs. Support:

- `exact_skill`: designer pins a specific Skill. Runtime must not substitute it silently.
- `capability`: declares a capability query; runtime may dynamically resolve one or more Skills when allowed.

Do not allow Flow→Flow recursion in v1. Keep the tagged step schema extensible so a future subflow type can be added deliberately.

Conditions must be declarative equality checks under `condition.when`; no eval, JavaScript, executable expressions, or natural-language condition engine.

Prefer no commit-SHA pinning. If compatibility needs to be asserted, use lightweight contract fields on exact references rather than an independent versioning subsystem.

# Suite design

A Suite references Skills and Flows non-owningly. It may contain metadata/tags and optional shared policies, quality gates, or artifact-contract references. Shared policy applies only when the Suite/Flow context is explicitly active; never inject it into standalone member Skill use.

The same Skill or Flow may be referenced by multiple Suites.

# Visibility

Public Flow/Suite → public references only. Private Flow/Suite → explicit public or private references. Never encode private Registry names or repository details in public manifests.

# Package architecture

Canonical roots:

- `skills/<name>/SKILL.md` plus justified resources;
- `flows/<name>/FLOW.json` plus optional evals;
- `suites/<name>/SUITE.json` plus optional evals.

Use JSON for Flow/Suite v1 manifests and native parsing/validation unless a concrete requirement justifies another dependency.

# Definition of done

Architecture is ready when object type and placement are justified, Skill independence is preserved, Flow/Suite references are non-owning, Flow handoffs/completion/failure semantics are explicit, visibility rules are safe, and routing does not degrade existing Skill discovery or dynamic compose.
