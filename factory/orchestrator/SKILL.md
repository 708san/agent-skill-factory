---
name: skill-factory-orchestrator
description: Route Agent Skill Factory requests across read-only behavior and explicit Registry mutation modes; enforce mutation authorization, visibility-aware Registry-first planning, Candidate Skill Inspection, Reuse Boundary Check, runtime discovery/composition, and progressive disclosure.
---

# Mission

Coordinate the Skill Factory without absorbing specialist responsibilities. GitHub-backed Factory modules and Agent Skills are the source of truth.

Flow and Suite extend the Registry without changing existing Skill semantics:

- Skill = standalone reusable capability and remains a global first-class Registry object;
- Flow = reusable saved execution plan for a known task;
- Suite = non-owning Skill/Flow relationship, discovery scope, and optional context-only shared policy;
- compose = runtime-generated dynamic execution plan for tasks not adequately covered by one Skill or a saved Flow.

Never move a Skill under a Suite, treat Suite membership as ownership, or inject Suite policy into standalone Skill use. The same Skill or Flow may be referenced by multiple Suites.

# Modes and read-only behavior

- `use`: select and execute existing Skills/Flows or model/tools without modifying repositories.
- `audit`: evaluate without changing files.
- ordinary/meta: explain/analyze without Registry mutation.
- `create`: explicitly create one or more reusable Registry objects after Registry-first gap analysis.
- `refactor`: explicitly change an existing Registry object while preserving valid behavior/contract unless a breaking refactor is intentionally scoped.
- `split`: explicitly split an oversized Skill when responsibilities are independently reusable.
- `merge`: explicitly combine genuinely overlapping Skills when one coherent responsibility remains.
- `publish`: explicitly create a public-safe variant from private source material.
- `rollback`: explicitly restore a previous known-good version through repository history.

For Flow/Suite Registry work, apply the same mode meanings and repository workflow to the requested Registry object; Suite is not normally an executable target.

# Creation Gate — Registry mutation authorization

The Creation Gate is not a mode classifier. Classify the request first.

Read-only `use`, read-only `audit`, and ordinary/meta behavior bypass the Creation Gate and must not mutate repositories.

Mutation-oriented modes—`create`, `refactor`, `split`, `merge`, `publish`, and `rollback`—must pass the Creation Gate before any Registry write/delete/persisting branch workflow. The gate passes only when the user expresses explicit creation/change intent for a reusable Registry object or explicitly requests the corresponding mutation.

Normal task execution is not mutation authorization. Requests such as `広告を作って`, `この文章を改善して`, `この会社を調査して`, and `画像を作って` stay in read-only use runtime. They may use existing Skill discovery, saved Flow execution, model/tool capability, or dynamic compose, but must not create or modify Skill/Flow/Suite packages.

Task-quality language alone is insufficient. `この処理をもっと良くして` means improve the task unless the user clearly refers to a Registry object or persistence/reuse.

If a mutation-oriented interpretation does not have explicit creation/change intent, deny mutation and continue only with a compatible read-only interpretation when one exists. Do not reclassify a legitimate read-only `audit` as `use` merely because no Creation Gate is needed.

Never auto-persist candidate Skills from ordinary task traffic. There is no automatic Skillizer path.

# Routing

1. Determine the request's mode/behavior before applying any gate.
2. For `use`, apply runtime routing below; no Creation Gate and no repository mutation.
3. For `audit`, load reviewer and the target Registry package; no Creation Gate and no repository mutation unless the user separately authorizes a change.
4. For ordinary/meta, answer read-only; no Creation Gate and no repository mutation.
5. For `create`, require Creation Gate, then run Registry Search → Candidate Skill Inspection → Reuse Boundary Check → Capability Gap Plan → architect → author → reviewer.
6. For `refactor`, require Creation Gate, then reviewer → inspect responsibility/contract/dependents → architect only if boundaries change → author → reviewer.
7. For `split` or `merge`, require Creation Gate, then architect → author → reviewer.
8. For `publish`, require Creation Gate, then publisher → reviewer.
9. For `rollback`, require Creation Gate, then use repository history and validate/review the restored state.

# Registry-first create pipeline

## Registry Search

Before designing new Registry objects:

1. decompose the requested reusable outcome into required capabilities;
2. determine the intended target visibility before authoring or writing;
3. search the Registry according to the visibility rules below;
4. identify strong existing Skill candidates for each capability;
5. do not author until search and candidate inspection are complete enough to distinguish reuse, extension, genuine gaps, and visibility constraints.

### Visibility-aware search scope

- private target: search both private and public Skills. For a reusable multi-capability/end-to-end request, search both private and public Flows. A private object may directly reuse public or private Registry objects.
- public target: search public Skills and, when relevant, public Flows for direct reuse. A public object must not directly depend on private Registry objects. Private objects may be inspected only as non-direct source/publish candidates when useful; exposing private material publicly requires publisher workflow/sanitization.
- target visibility not yet determined: do not decide a capability gap from only one Registry. Search sufficient public/private evidence to avoid a false gap, then make target visibility explicit before finalizing the gap plan or authoring/writing.

Search results identify candidates; they do not prove capability gaps.

## Candidate Skill Inspection

When Registry Search returns a strong candidate for a requested capability, call `getSkill` and inspect the current SKILL.md before deciding `reuse`, `extend`, or `create`.

Inspect at least:

- responsibility / scope;
- trigger / non-trigger;
- workflow and supported modes;
- review / diagnostic / revision stages;
- inputs / outputs;
- quality gate;
- failure modes;
- handoff semantics;
- explicit boundary/non-split statements such as `do not split`, `keep X and Y in one workflow`, `X is part of this responsibility`, or equivalent.

Do not decide from name/description alone. A capability may already be owned as a supported mode, workflow step, review stage, diagnostic stage, or output variant even when it is not named in the Skill title.

Load extra Skill resources only when SKILL.md indicates they are required to resolve the boundary question.

## Reuse Boundary Check

Run before Capability Gap Plan finalization for every proposed new Skill capability.

### Existing Skill already owns the capability

If an inspected candidate legitimately includes the capability inside its coherent responsibility—as a supported mode, workflow/sub-step, review/diagnostic stage, or output variant—use `reuse`. Do not carve that internal sub-responsibility into a new Skill.

If one existing Skill already owns the complete requested reusable workflow, reuse that Skill alone; do not create a Flow merely to mirror its internal stages.

### Partial fit

If the capability naturally belongs inside the existing Skill's responsibility but coverage is incomplete, consider `extend` before `create`. Persisted extend requires contract review, required dependent-scope inspection, and backward-compatibility analysis.

### Independent responsibility

`create` is allowed only when all are true:

- independent user goal;
- independently useful output;
- independent reuse value across workflows;
- not an implementation detail/sub-step of an existing Skill.

### Explicit non-split boundary

If an inspected Skill says `do not split`, `keep X and Y in one workflow`, `X is part of this responsibility`, or equivalent, ordinary create must respect that boundary. Changing it requires explicit refactor/split intent.

## Capability Gap Plan

Maintain an internal plan with one primary disposition per required capability:

- `reuse`: existing Skill is sufficient unchanged;
- `extend`: existing Skill can be generalized/improved backward-compatibly within its responsibility;
- `create`: genuinely missing reusable capability requires a new Skill;
- `model`: ordinary model capability should not become a Skill;
- `external_tool`: responsibility belongs to an external tool/API.

For every capability record at least:

- `capability`;
- `disposition`;
- `candidateSkills`;
- `inspectedCandidates`;
- `boundaryDecision`;
- `supportingEvidence`;
- `splitJustification` when disposition=`create`;
- `targetVisibility`;
- `searchedScopes`.

A `create` disposition is blocked unless `splitJustification` explains why the capability is not an existing Skill's internal/sub-responsibility and demonstrates an independent user goal, independently useful output, and independent reuse value.

A `reuse` disposition is valid only when the target may legally reference the reused object. New Skill creation is not the default. Description-level search alone is insufficient evidence for `create` when a strong candidate exists.

If every required capability already exists, create no new Skill. If one existing Skill owns the full coherent requested workflow, create no Flow merely to externalize its stages. If multiple independent Skills exist and only reusable orchestration is missing, create only the Flow when appropriate.

## Extension safety

For any persisted change to an existing Skill:

1. load the Skill and inspect responsibility, trigger/non-trigger behavior, workflow, inputs/outputs, quality gate, handoff contract, and failure modes;
2. when `getRegistryDependents` is available, dependent-impact inspection is mandatory before approving the persisted change;
3. for a public Skill, inspect both public dependents and private dependents in their explicitly selected Registry scopes/refs;
4. for a private Skill, inspect private dependents in the explicitly selected private Registry scope/ref;
5. use dependent evidence to evaluate backward compatibility and contract impact; the existence of dependents alone does not forbid extension;
6. allow `extend` only when the responsibility remains coherent and the existing contract remains backward compatible;
7. if the proposed work is an independent responsibility, design a separate Skill;
8. if the existing Skill's meaning/contract would break, do not silently modify it as part of create—route to explicit `refactor` or propose a separate Skill.

## Flow-first reusable multi-capability design

For explicit requests such as `○○する再利用可能な仕組みを作って`:

- single coherent reusable responsibility → one Skill, no Flow;
- reusable known multi-capability process → Flow + independently reusable Skills;
- temporary multi-Skill execution → dynamic compose, no persistence.

Apply Reuse Boundary Check before Flow-first decomposition. Do not transform one existing Skill's intentionally unified internal workflow into a Flow plus duplicate sub-Skills.

In a new Flow, maximize reuse of existing Skills and create only missing independently reusable Skill capabilities identified by the Capability Gap Plan. Do not build a giant Skill merely to avoid a Flow.

### Flow v1 representability guard

Flow v1 supports only `exact_skill` and `capability` step types. `capability` resolves through Skill discovery; it is not a direct model-native or external-tool step.

Before sending a Flow design to Architect/Author, identify required capabilities whose gap-plan disposition is `model` or `external_tool`. If a required capability cannot be represented legally through an existing or independently justified Skill under current Flow v1, mark the design `unsupported_flow_capability` (or equivalent blocker).

Fail closed:

- do not drop the required step;
- do not turn a `model` capability into an unnecessary Skill just to fit Flow v1;
- do not bury `external_tool` responsibility inside a Skill just to fit Flow v1;
- do not invent a validator-unsupported Flow step type.

An architecture blocker prevents Flow authoring until the design becomes representable or the runtime/schema is extended in a later Factory stage.

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

Procedure:

1. Call `searchSkills` with a task-focused query and an explicit visibility scope.
2. Evaluate candidates by responsibility, description, optional metadata, user constraints, and required output.
3. Prefer one Skill when one coherent responsibility can complete the task.
4. If one Skill is clearly best, call `getSkill` without unnecessary confirmation.
5. Load only the selected Skill's required references/resources and execute it.
6. If the goal genuinely requires multiple independently reusable responsibilities, switch to `compose`.

Do not mechanically search for every request. Use ordinary/meta routing for explanation-only requests.

Flow search is separate from `searchSkills`; do not blend Flow results into Skill scoring or discovery results. A local/single-responsibility request stays on the Skill path even when a broader Flow exists.

If discovery finds no match during an ordinary task, fall back to model/tool capability or dynamic compose as appropriate. Do not transition to `create` and do not mutate the Registry.

## C. recommend

Use when the user asks only for candidates or availability and does not want execution yet.

Procedure:

1. Call `searchSkills`.
2. Present the best candidates with their intended use and visibility.
3. Do not call `getSkill` or execute a Skill unless the user asks to proceed.

Skill recommendation remains Skill-only unless the user specifically asks for Flows, Suites, or saved end-to-end plans.

## D. compose

Use only when multiple Skills create clear value and one Skill cannot adequately complete the user's final goal.

Before execution, form an internal Skill Execution Plan containing user goal, selected Skills, execution order, each Skill responsibility, inputs, expected outputs, handoffs, dependencies, and completion condition.

Search the current Registry and select the minimum Skill set needed. Do not use a Skill simply because it is available. Do not compose merely because a workflow has multiple steps.

If one Skill's core workflow naturally owns several internal stages—such as review → diagnosis → revision—keep them inside that Skill rather than composing or extracting sub-Skills merely because the stages are separately describable.

For a multi-responsibility request, first use a saved Flow only when a registered Flow strongly matches the requested end-to-end outcome. If no adequate Flow exists, keep dynamic compose.

Dynamic compose is read-only temporary execution; it never implies Flow creation without explicit persistence intent.

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

Do not search Skills for explanation-only questions, including general knowledge, Factory internals, or conceptual questions that do not ask Factory to perform a concrete task.

# User control

Respect explicit user constraints whenever compatible with existence, visibility, safety, and required inputs. Do not silently expand scope beyond those constraints.

The same rule applies to explicit Flow selection, step exclusions, and Suite scoping; excluding an applicable required Flow step prevents a full-success claim.

# Repository policy

- GitHub files returned by Actions are authoritative; do not embed fixed copies of Skill bodies.
- Read-only `use`, `audit`, and ordinary/meta behavior never branch, write, delete, publish, or open a PR merely to execute or inspect Registry content.
- Ordinary tasks remain read-only even if no matching Registry object exists.
- If use/audit reveals an improvement opportunity, mention it only as a suggestion unless the user explicitly requests a Registry change.
- Mutation-oriented modes must pass the Creation Gate, use a non-main branch, and perform branch → write → validate → diff → reviewer.
- Never write directly to `main`.
- Create a pull request only when the user explicitly requests PR creation or explicitly authorizes proceeding through PR when acceptable.
- Public/private repositories are security boundaries. Multi-Skill use may combine public and private Skills read-only, but private content must never be written to public storage outside the publisher workflow.

For Registry references, public Flow/Suite objects may reference public objects only; private Flow/Suite objects may explicitly reference public or private Registry objects. Public manifests must not reveal private Registry names or repository information.

# Progressive disclosure

For ordinary use, load resources in this order and only as needed:

orchestrator → selected Flow/Skill → files required by that object → compact handoff → next selected Skill.

For read-only audit, load only reviewer → target package/diff → required evidence; do not load authoring modules unless the user later authorizes change.

For explicit creation/change, use:

orchestrator → visibility-aware Registry Search results → strong candidate SKILL.md inspection → Reuse Boundary Check → Capability Gap Plan with candidate/boundary/visibility evidence → required existing Skill/Flow/dependent details → architect → author → reviewer.

Do not load architect/author merely because an ordinary task or audit could theoretically become reusable. Do not load architect/author when reuse already satisfies the explicit create request. Do not load Author for a Flow design blocked as `unsupported_flow_capability`.

# Definition of done

A routed request is complete only when:

- mode/behavior was classified before mutation authorization;
- read-only use/audit/ordinary-meta bypassed the Creation Gate and performed no Registry mutation;
- mutation-oriented modes passed the Creation Gate before persistence;
- implicit concrete-task discovery remained available and failed discovery did not transition to create;
- recommend/dynamic compose/saved Flow execution remained intact;
- explicit create performed visibility-aware Registry Search, Candidate Skill Inspection, Reuse Boundary Check, and Capability Gap planning before authoring;
- strong candidates were inspected beyond description-level metadata;
- every create disposition has evidence-backed splitJustification proving independent responsibility;
- partial fits considered extend and explicit non-split boundaries were preserved;
- target visibility and searched scopes were explicit before authoring/writes;
- persisted existing-Skill changes inspected contract and required dependent scopes when available;
- multi-capability Flow-first design did not decompose one coherent existing Skill workflow;
- unrepresentable required model/external-tool Flow capabilities failed closed before Author;
- user constraints and public/private boundaries were preserved;
- change modes completed validation, diff, and reviewer checks before optional PR creation.
