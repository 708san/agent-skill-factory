---
name: skill-factory-orchestrator
description: Route Agent Skill Factory requests across create, use, audit, refactor, split, merge, publish, and rollback; support exact use, implicit discovery, recommendation, and minimal multi-Skill composition with progressive disclosure.
---

# Mission

Coordinate the Skill Factory without absorbing specialist responsibilities. GitHub-backed Factory modules and Agent Skills are the source of truth.

Flow and Suite extend the Registry without changing existing Skill semantics:

- Skill = standalone reusable capability and remains a global first-class Registry object;
- Flow = reusable saved execution plan for a known task;
- Suite = non-owning Skill/Flow relationship, discovery scope, and optional context-only shared policy;
- compose = runtime-generated dynamic execution plan for tasks not adequately covered by one Skill or a saved Flow.

Never move a Skill under a Suite, treat Suite membership as ownership, or inject Suite policy into standalone Skill use. The same Skill or Flow may be referenced by multiple Suites.

# Modes

- `use`: select and execute existing Skills without modifying repositories.
- `create`: design and implement one or more new Skills.
- `audit`: evaluate without changing files.
- `refactor`: improve an existing Skill while preserving valid behavior.
- `split`: split an oversized Skill when responsibilities are independently reusable.
- `merge`: combine genuinely overlapping Skills when one coherent responsibility remains.
- `publish`: create a public-safe variant from private source material.
- `rollback`: restore a previous known-good version through repository history.

For Flow/Suite Registry work, apply the same mode meanings and repository workflow to the requested Registry object; Suite is not normally an executable target.

# Routing

1. Determine the mode from the user's request; infer it when obvious.
2. For `use`, apply the runtime routing below and never write to a repository.
3. For `audit`, load reviewer and the target Skill/package.
4. For `create`, load architect → author → reviewer.
5. For `refactor`, load reviewer → architect only if boundaries change → author → reviewer.
6. For `split` or `merge`, load architect → author → reviewer.
7. For `publish`, load publisher → reviewer.
8. For `rollback`, use repository operations and validate the restored state.

For Flow/Suite create, audit, or refactor requests, the target Registry object/package replaces the Skill/package referent above; the specialist sequence is unchanged.

# Use runtime

Classify a use request as `exact`, `discover`, `recommend`, or `compose`. Ordinary/meta questions stay outside Skill use.

Saved Flow routing is an additional path that does not redefine these existing Skill paths. `$skill-name` continues to mean exact Skill invocation. `$flow:<flow-name>` is the non-conflicting explicit Flow syntax.

## A. exact

Use when the user explicitly names a Skill, including `$skill-name`, `skill-nameを使って`, or an explicit sequence such as `$skill-a → $skill-b`.

For one named Skill:

1. Resolve public/private visibility. If the same name exists in both, keep visibility explicit.
2. Call `getSkill` directly. Do not search first unless visibility resolution requires it.
3. Call `getSkillFile` only for files the current `SKILL.md` requires for this task.
4. Execute the Skill.

For multiple explicitly named Skills, verify existence, visibility, user-specified order, and input/output compatibility. Treat the request as exact composition and follow `references/composition-runtime.md` for handoff rules. Do not add extra Skills unless required to satisfy the user's goal and constraints.

Suite membership must not change this exact Skill behavior or inject Suite policy.

## B. discover

Use when the user did not name a Skill but is asking Agent Skill Factory to perform a concrete task—such as editing, creating, analyzing, transforming, organizing, planning, reviewing, or producing an artifact—and an existing Skill could plausibly improve task-specific execution.

The user does not need to say “Skill”, “適切なSkill”, or “使えるSkill”. Being invoked as Agent Skill Factory plus a concrete execution request is sufficient to consider discovery.

Examples that should trigger discovery when a matching Skill plausibly exists:

- `この文章をAIっぽくなくしたい。`
- `このLPをもっと訴求力のある文章にしたい。`
- `この調査結果を比較表に整理して。`
- `広告画像の構図を考えて。`

Procedure:

1. Call `searchSkills` with a task-focused query and an explicit visibility scope.
2. Evaluate candidates by responsibility, description, optional metadata, user constraints, and required output.
3. Prefer one Skill when one coherent responsibility can complete the task.
4. If one Skill is clearly best, call `getSkill` without unnecessary confirmation.
5. Load only the selected Skill's required references/resources and execute it.
6. If the goal genuinely requires multiple independently reusable responsibilities, switch to `compose`.

Do not mechanically search for every request. Use ordinary/meta routing for explanation-only requests.

Flow search is separate from `searchSkills`; do not blend Flow results into Skill scoring or discovery results. A local/single-responsibility request stays on the Skill path even when a broader Flow exists.

## C. recommend

Use when the user asks only for candidates or availability and does not want execution yet.

Examples:

- `文章改善に使えるSkillある？`
- `競合調査向けのSkillを教えて。`
- `今回はまだ実行しなくていい。`

Procedure:

1. Call `searchSkills`.
2. Present the best candidates with their intended use and visibility.
3. Do not call `getSkill` or execute a Skill unless the user asks to proceed.

Skill recommendation remains Skill-only unless the user specifically asks for Flows, Suites, or saved end-to-end plans.

## D. compose

Use only when multiple Skills create clear value and one Skill cannot adequately complete the user's final goal.

Compose is appropriate when one or more of the following apply:

- multiple independent specialist judgments are required;
- multiple independently useful outputs are required;
- Skill A output is required input to Skill B;
- responsibilities are independently reusable;
- separating responsibilities materially improves quality or reuse.

Do not compose merely because a workflow has multiple steps. Prefer one Skill when its core workflow naturally includes those steps, such as `review → rewrite` inside `human-writing-review`.

Before execution, form an internal Skill Execution Plan containing:

- user goal
- selected Skills
- execution order
- each Skill responsibility
- input for each Skill
- expected output
- handoff
- dependencies
- completion condition

Search the current Registry and select the minimum Skill set needed. Do not use a Skill simply because it is available.

Load `references/composition-runtime.md` when composition is selected.

For a multi-responsibility request, first use a saved Flow only when a registered Flow strongly matches the requested end-to-end outcome. If no adequate Flow exists, keep the existing dynamic compose behavior above.

# Saved Flow routing

Use a Flow for a deliberately saved, known end-to-end execution plan, not merely because a Flow exists.

- explicit `$flow:<name>` → load that Flow;
- local/single responsibility → use Skill discovery/exact routing;
- known end-to-end task with a strongly matching registered Flow → Flow may be selected;
- multi-responsibility task without an adequate Flow → compose.

When executing a Flow:

1. load and validate the Flow;
2. honor DAG dependencies, declared handoffs, conditions, and completion semantics;
3. evaluate only the limited declarative `condition.when` equality form;
4. for `exact_skill`, call the named Skill directly and never silently substitute another Skill;
5. if an exact Skill is missing or incompatible, fail that step/Flow rather than changing its meaning;
6. for `capability`, dynamically discover the capability through existing Skill discovery and use compose only when the capability step permits/requires multi-Skill resolution;
7. do not claim full success when an applicable required step is incomplete or explicitly excluded;
8. v1 does not recursively execute Flow → Flow references.

# Suite discovery scope

A Suite is not normally executed. When a Suite is explicitly selected as context:

1. load the Suite;
2. scope relevant Skill/Flow discovery to its referenced members;
3. apply Suite policies, quality gates, or artifact-contract references only in that explicit Suite/Flow context;
4. never inject those policies into standalone member Skill execution.

# Ordinary / meta routing

Do not search Skills for explanation-only questions, including:

- general knowledge questions;
- questions about how Factory works;
- explanations of `searchSkills`, `getSkill`, repository management, or Factory structure;
- conceptual questions that do not ask Factory to perform a concrete task.

Examples:

- `AIっぽい文章とはどういう文章？`
- `searchSkillsはどういう仕組み？`
- `Factoryのrepository構造を教えて。`

# User control

Respect explicit user constraints whenever compatible with existence, visibility, safety, and required inputs. Examples include:

- `$skill-aだけ使って`
- `画像生成はまだしないで`
- `構図までで止めて`
- `このSkillは使わないで`
- `$skill-a → $skill-b の順で使って`

Do not silently expand scope beyond those constraints.

The same rule applies to explicit Flow selection, step exclusions, and Suite scoping; excluding an applicable required Flow step prevents a full-success claim.

# Repository policy

- GitHub files returned by Actions are authoritative; do not embed fixed copies of Skill bodies.
- `use` mode is read-only. Never branch, write, delete, publish, or open a PR merely to use a Skill.
- If use reveals an improvement opportunity, mention it only as a suggestion unless the user requests a change.
- Change modes must use a non-main branch and perform branch → write → validate → diff → reviewer.
- Never write directly to `main`.
- Create a pull request only when the user explicitly requests PR creation or explicitly authorizes proceeding through PR when acceptable.
- Public/private repositories are security boundaries. Multi-Skill use may combine public and private Skills read-only, but private content must never be written to public storage outside the publisher workflow.

For Registry references, public Flow/Suite objects may reference public objects only; private Flow/Suite objects may explicitly reference public or private Registry objects. Public manifests must not reveal private Registry names or repository information.

# Progressive disclosure

Load resources in this order and only as needed:

orchestrator → required Factory module(s) → selected Skill → files required by that Skill → compact handoff → next selected Skill.

Do not preload all Factory modules, all Skills, all SKILL.md files, or all references.

For Flow execution, load the Flow manifest first and then only the Skills/resources required by applicable steps. Suite manifests are loaded only when Suite context is requested or required for scoped discovery.

# Definition of done

A routed request is complete only when:

- the correct mode and use path were selected;
- implicit concrete-task discovery was considered when appropriate;
- ordinary/meta questions avoided unnecessary discovery;
- composition used the smallest sufficient Skill set;
- user constraints and public/private boundaries were preserved;
- use mode performed no repository mutation;
- change modes completed validation, diff, and reviewer checks before optional PR creation.

For Flow/Suite-aware routing, also verify that local work was not absorbed into a Flow, exact Flow steps were not substituted, Suite policy stayed context-scoped, and uncovered multi-responsibility work remained dynamically composed.
