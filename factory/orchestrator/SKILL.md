---
name: skill-factory-orchestrator
description: Route Agent Skill Factory requests across create, use, audit, refactor, split, merge, publish, and rollback; preserve exact Skill use, discovery, recommendation, dynamic composition, and first-class saved Flows and Suites.
---

# Mission

Coordinate the Skill Factory without absorbing specialist responsibilities. GitHub-backed Factory modules and Registry objects are the source of truth.

# Registry concepts

Keep these meanings separate:

- Skill = standalone reusable capability. Skills remain global first-class Registry objects.
- Flow = reusable saved execution plan for a known task. A Flow references Skills; it does not contain their implementation instructions.
- Suite = non-owning relationship, discovery scope, and optional shared policy for related Skills and Flows. A Suite is not normally executable.
- compose = runtime-generated dynamic execution plan for an unknown or insufficiently covered multi-responsibility task.

Never move a Skill into a Suite, inject Suite policy into standalone Skill use, or treat Suite membership as ownership. One Skill or Flow may belong to multiple Suites.

# Modes

- `use`: select and execute existing Skills or Flows without modifying repositories.
- `create`: design and implement Registry or Factory objects.
- `audit`: evaluate without changing files.
- `refactor`: improve an existing object while preserving valid behavior.
- `split`: split an oversized responsibility or package when independently reusable boundaries justify it.
- `merge`: combine genuinely overlapping objects when one coherent responsibility remains.
- `publish`: create a public-safe variant from private source material.
- `rollback`: restore a previous known-good version through repository history.

# Routing

1. Determine the mode.
2. For `use`, apply runtime routing below and never write to a repository.
3. For `audit`, load reviewer and the target package/object.
4. For `create`, load architect → author → reviewer.
5. For `refactor`, load reviewer → architect if boundaries change → author → reviewer.
6. For `split` or `merge`, load architect → author → reviewer.
7. For `publish`, load publisher → reviewer.
8. For `rollback`, use repository history and validate the restored state.

# Use runtime

Classify concrete use as `exact`, `flow`, `discover`, `recommend`, or `compose`. Ordinary/meta questions stay outside Registry execution.

## A. exact Skill

Existing exact Skill syntax is unchanged. `$skill-name`, `skill-nameを使って`, and explicit Skill sequences still mean Skills.

For one named Skill:

1. Resolve visibility.
2. Call `getSkill` directly; do not search first unless visibility resolution requires it.
3. Load only files required by the current SKILL.md.
4. Execute the Skill exactly as before.

Suite membership must not change standalone Skill behavior or inject Suite policy.

## B. explicit or implicit Flow

Use `$flow:<flow-name>` for explicit Flow invocation so it cannot collide with `$skill-name`.

For implicit routing, consider a Flow only when the request is a known end-to-end task and a registered Flow strongly matches the whole requested outcome. Do not route a local modification or single responsibility into a Flow merely because a matching Flow exists.

Routing priority is based on request granularity, not object existence:

- local / single responsibility → Skill discovery;
- known end-to-end task with a strong matching Flow → Flow;
- multi-responsibility task without an adequate Flow → compose.

Flow search is separate from Skill search. Do not change or blend `searchSkills` scoring/results with Flow results.

When executing a Flow:

1. load and validate the Flow;
2. evaluate only declarative `condition.when` equality conditions;
3. honor dependencies and handoff references;
4. for `exact_skill`, call the named Skill directly and never silently substitute another Skill;
5. if an exact Skill is missing or incompatible, fail that Flow step and do not claim full Flow success;
6. for `capability`, dynamically resolve the requested capability via Skill discovery, and use compose only when the capability step explicitly permits/needs multi-Skill resolution;
7. required applicable steps must complete for full success; user exclusion of a required applicable step prevents a full-success claim;
8. optional or condition-false steps may be skipped without invalidating completion when the manifest permits it.

Flow-to-Flow recursion is not supported in v1. Use capability steps plus compose for dynamic compound work.

## C. discover Skill

Use when the user did not name a Skill and asks Factory to perform a concrete local or single-responsibility task for which a Skill could improve execution.

1. Call `searchSkills` with a task-focused query and explicit visibility.
2. Evaluate candidates by responsibility, metadata, user constraints, and output.
3. Prefer one Skill when one coherent responsibility can complete the task.
4. If clearly best, call `getSkill` without unnecessary confirmation.
5. Load only required resources and execute it.
6. If the goal genuinely requires multiple independent responsibilities and no adequate Flow applies, switch to compose.

## D. recommend

When the user wants candidates only, call the relevant search operation and present candidates without loading/executing them. Skill recommendation remains Skill-only unless the user asks about Flows or end-to-end plans.

## E. compose

Compose remains runtime-generated and dynamic. Use it when multiple Skills create clear value, one Skill is insufficient, and no adequate saved Flow covers the requested end-to-end task.

Before execution, form an internal Skill Execution Plan containing goal, selected Skills, order, responsibilities, inputs, expected outputs, handoffs, dependencies, and completion condition. Search the current Registry and select the minimum Skill set needed. Load `references/composition-runtime.md` when composition is selected.

# Suite scope

A Suite is a discovery scope, not an execution target. When a Suite is explicitly named:

1. load the Suite;
2. restrict relevant Skill/Flow discovery to its referenced members;
3. apply Suite policies, quality gates, or artifact contracts only inside that explicit Suite/Flow context;
4. never persist or inject Suite policy into standalone Skill execution.

Public Suite/Flow objects may reference public objects only. Private Suite/Flow objects may explicitly reference public or private objects.

# User control

Respect explicit user constraints, including exact Skill/Flow selection, ordering, exclusions, and stop points. Do not silently expand scope. Exact Flow steps are semantic pins, not suggestions.

# Repository policy

- GitHub files returned by Actions are authoritative.
- `use` mode is read-only.
- Change modes use a non-main branch and branch → write → validate → diff → reviewer.
- Never write directly to main.
- Create a PR only when explicitly requested or authorized.
- Public/private repositories are security boundaries; public manifests must not leak private Registry names or repository information.

# Definition of done

A routed request is complete only when exact Skill compatibility is preserved, Flow routing is granularity-aware, Suite policy is scoped, compose remains dynamic for uncovered multi-responsibility work, user constraints are preserved, and change-mode validation/diff/review are complete.
