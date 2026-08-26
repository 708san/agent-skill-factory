# Architecture

## Principle

GitHub is the source of truth. ChatGPT Web is a client that loads current Factory modules and Registry objects through a narrow Action API.

Agent Skill Factory separates read-only runtime behavior from Registry mutation. Ordinary tasks may discover and execute existing Skills/Flows or compose them dynamically; read-only audits may inspect Registry packages; neither mutates the Registry. Persistence begins only after explicit creation/change authorization.

## Repositories

- `agent-skill-factory` — Factory framework, API, GPT bootstrap files
- `agent-skills-public` — public completed Skills/Flows/Suites
- `agent-skills-private` — confidential completed Skills/Flows/Suites

## Factory responsibilities

- Orchestrator: request classification, mutation-only Creation Gate, mode routing, Registry Search, Capability Gap Plan, runtime exact/discover/recommend/compose/Flow routing
- Architect: Registry-first capability placement, reuse/extend/create boundaries, dependent-impact analysis, Flow-first multi-capability design, contracts and handoffs
- Author: implement approved Skill/Flow/Suite package changes only
- Reviewer: independent routing/authorization/behavior/outcome/regression evaluation, including Registry-first build gates
- Publisher: private → public-safe conversion

## Routing and mutation authorization

Classify the request first:

- read-only: `use`, `audit`, ordinary/meta → no Creation Gate, repository mutation forbidden;
- mutation-oriented: `create`, `refactor`, `split`, `merge`, `publish`, `rollback` → Creation Gate required before persistence.

The Creation Gate is therefore a Registry mutation authorization gate, not a mode gate. A read-only audit remains reachable without creation/change intent.

## Registry-first Build Pipeline

After an explicit `create` has been classified and mutation authorization passes:

`Creation Gate → Registry Search → Capability Gap Plan → Architect → Author → Reviewer`

### Creation Gate

Ordinary execution requests are read-only even when they sound generative, for example advertising creation, prose improvement, research, image generation, or analysis. They may use existing Registry objects, model capability, tools, or dynamic compose. They must not create/change Skills, Flows, or Suites.

Read-only audit is also outside the gate. Persistence is allowed only when the user explicitly asks to create/change a reusable Registry object or requests another mutation-oriented mode.

There is no automatic Skillizer that mines ordinary task traffic and persists candidates without user intent.

### Registry Search

Before new authoring, search existing Skills for every reusable capability. For a reusable multi-capability/end-to-end request, search existing Flows as well.

Failed Skill discovery during an ordinary task falls back to model/tool/dynamic compose as appropriate and never transitions into create.

### Capability Gap Plan

Each required capability is classified as:

- `reuse` — use an existing Skill unchanged;
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

Flow design reuses existing Skills first and creates only capability gaps. If all Skills already exist, only a Flow may be needed. If an existing Flow already matches, no new object is needed.

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

Repository reads/search, dependents lookup, branch creation, validation, diff, PR, and rollback plumbing belong to the Action API rather than SKILL.md judgment logic. v0.10 Registry-first routing is implemented with existing Actions; no new backend API is required for this stage.
