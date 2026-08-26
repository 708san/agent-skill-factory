# Architecture

## Principle

GitHub is the source of truth. ChatGPT Web is a client that loads current Factory modules and Registry objects through a narrow Action API.

Agent Skill Factory separates read-only runtime behavior from Registry mutation. Ordinary tasks may discover and execute existing Skills/Flows or compose them dynamically; read-only audits may inspect Registry packages; neither mutates the Registry. Persistence begins only after explicit creation/change authorization.

## Repositories

- `agent-skill-factory` — Factory framework, API, GPT bootstrap files
- `agent-skills-public` — public completed Skills/Flows/Suites
- `agent-skills-private` — confidential completed Skills/Flows/Suites

## Factory responsibilities

- Orchestrator: request classification, mutation-only Creation Gate, visibility-aware Registry Search, Capability Gap Plan, runtime exact/discover/recommend/compose/Flow routing
- Architect: Registry-first capability placement, visibility and reuse boundaries, dependent-impact analysis, Flow-first multi-capability design, Flow representability, contracts and handoffs
- Author: implement only approved and currently representable Skill/Flow/Suite package changes
- Reviewer: independent routing/authorization/visibility/representability/behavior/outcome/regression evaluation
- Publisher: private → public-safe conversion

## Routing and mutation authorization

Classify the request first:

- read-only: `use`, `audit`, ordinary/meta → no Creation Gate, repository mutation forbidden;
- mutation-oriented: `create`, `refactor`, `split`, `merge`, `publish`, `rollback` → Creation Gate required before persistence.

The Creation Gate is therefore a Registry mutation authorization gate, not a mode gate. A read-only audit remains reachable without creation/change intent.

## Registry-first Build Pipeline

After an explicit `create` has been classified and mutation authorization passes:

`Creation Gate → Registry Search → Capability Gap Plan → Architect → Author → Reviewer`

### Registry Search visibility

Search scope is determined by the target Registry visibility:

- private target: search both private and public Skills; for multi-capability/end-to-end design, search both private and public Flows. A private object may directly reuse public or private objects.
- public target: search public Skills/Flows for direct reuse. Public objects never gain private Registry dependencies. Private objects may be inspected only as non-direct source/publish candidates when useful; publicizing private material goes through Publisher/sanitization.
- visibility unresolved: do not finalize a gap from one Registry. Gather sufficient public/private evidence, then make target visibility explicit before authoring or writing.

Capability Gap Plan evidence includes `targetVisibility` and the Registry scopes searched for each capability decision. This prevents false gaps and illegal reuse.

### Capability Gap Plan

Each required capability is classified as:

- `reuse` — use an existing legal Skill unchanged;
- `extend` — backward-compatible generalization/improvement of an existing Skill;
- `create` — genuinely missing reusable capability;
- `model` — ordinary model behavior, no Registry object;
- `external_tool` — external tool/API responsibility.

The plan minimizes new persistent objects rather than defaulting to Skill creation.

### Extension safety

Any persisted existing-Skill change requires responsibility/contract review. When `getRegistryDependents` is available, dependent-impact inspection is mandatory:

- public Skill → public dependents + private dependents;
- private Skill → private dependents.

Queries use explicitly selected Registry scopes/refs. Dependent evidence informs backward compatibility and migration risk; the existence of dependents alone does not approve or forbid an extension. Backward-compatible generalization within the same responsibility may extend. Independent responsibility becomes a separate Skill. Contract-breaking change becomes explicit refactor rather than an incidental create side effect.

### Flow-first multi-capability design

- single reusable responsibility → Skill
- reusable known multi-capability process → Flow + independently reusable Skills
- temporary multi-Skill execution → dynamic compose

Flow design reuses existing legal Skills first and creates only genuine independently reusable capability gaps. If all Skills already exist, only a Flow may be needed. If an existing Flow already matches, no new object is needed.

### Flow v1 representability

Current Flow v1 supports only `exact_skill` and `capability` steps. `capability` is resolved through Skill discovery; Flow v1 does not directly execute model-native responsibilities or external tool/API actions.

If a required reusable Flow capability remains disposition=`model` or `external_tool` and there is no independently justified legal Skill representation, architecture fails closed with `unsupported_flow_capability` (or equivalent). The required capability must not be silently omitted, converted into an unnecessary Skill merely to fit schema, hidden inside an unrelated Skill, or authored as an unsupported step type.

Only Flow designs fully representable by current v1 step semantics proceed to Author.

Direct `model` and `external_tool` Flow step support is a candidate for the next Factory/runtime/schema stage, not part of v0.10 stage 1. Adding it will require coordinated Flow schema, validator, runtime, authoring, review, and compatibility work.

## Runtime execution paths

The build pipeline does not replace runtime behavior:

- exact Skill invocation remains direct;
- implicit existing-Skill discovery remains available for concrete tasks;
- recommend remains read-only;
- saved Flow execution remains available;
- dynamic compose remains available for temporary multi-capability tasks;
- use mode remains read-only;
- audit remains read-only and does not require mutation authorization.

A failed Registry search during ordinary execution does not transition into create mode.

## Public/private boundary

Public Registry objects may reference public objects only. Private Registry objects may reference public or private objects explicitly. Runtime read-only composition may use permitted public/private material, but private contents must never be persisted into public storage outside the publisher workflow.

Dependent-impact inspection follows the boundary: public target Skills can affect both public and private dependents; private target Skills are inspected within private dependents only.

## Repository workflow

Mutation-oriented modes require Creation Gate authorization, use a non-main branch, and follow branch → write → validate → diff → reviewer. Direct writes to `main` are forbidden. PR creation remains explicit opt-in.

## Tool responsibilities

Repository reads/search, dependents lookup, branch creation, validation, diff, PR, and rollback plumbing belong to the Action API rather than SKILL.md judgment logic. v0.10 Registry-first routing and Flow representability are implemented with existing Actions; no new backend API is required for this stage.
