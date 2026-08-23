# Architecture

## Principle

GitHub is the source of truth. ChatGPT Web is a client that loads current Factory modules and Registry objects through a narrow Action API.

Agent Skill Factory separates runtime task execution from Registry construction. Ordinary tasks may discover and execute existing Skills/Flows or compose them dynamically, but they do not mutate the Registry. Persistence begins only after explicit creation/change intent.

## Repositories

- `agent-skill-factory` — Factory framework, API, GPT bootstrap files
- `agent-skills-public` — public completed Skills/Flows/Suites
- `agent-skills-private` — confidential completed Skills/Flows/Suites

## Factory responsibilities

- Orchestrator: Creation Gate, mode routing, Registry Search, Capability Gap Plan, runtime exact/discover/recommend/compose/Flow routing
- Architect: Registry-first capability placement, reuse/extend/create boundaries, Flow-first multi-capability design, contracts and handoffs
- Author: implement approved Skill/Flow/Suite package changes only
- Reviewer: independent routing/behavior/outcome/regression evaluation
- Publisher: private → public-safe conversion

## Registry-first Build Pipeline

Explicit creation/change follows:

`Creation Gate → Registry Search → Capability Gap Plan → Architect → Author → Reviewer`

### Creation Gate

Ordinary execution requests are read-only even when they sound generative, for example advertising creation, prose improvement, research, image generation, or analysis. They may use existing Registry objects, model capability, tools, or dynamic compose. They must not create/change Skills, Flows, or Suites.

Persistence is allowed only when the user explicitly asks to create/change a reusable Registry object or make a process reusable/persistent.

There is no automatic Skillizer that mines ordinary task traffic and persists candidates without user intent.

### Registry Search

Before new authoring, search existing Skills for every reusable capability. For a reusable multi-capability/end-to-end request, search existing Flows as well.

### Capability Gap Plan

Each required capability is classified as:

- `reuse` — use an existing Skill unchanged;
- `extend` — backward-compatible generalization/improvement of an existing Skill;
- `create` — genuinely missing reusable capability;
- `model` — ordinary model behavior, no Registry object;
- `external_tool` — external tool/API responsibility.

The plan minimizes new persistent objects rather than defaulting to Skill creation.

### Extension safety

An extension requires inspection of the existing Skill responsibility/contract and, when available, Registry dependents. Backward-compatible generalization within the same responsibility may extend. Independent responsibility becomes a separate Skill. Contract-breaking change becomes explicit refactor rather than an incidental create side effect.

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
- use mode remains read-only.

A failed Registry search during ordinary execution does not transition into create mode.

## Public/private boundary

Public Registry objects may reference public objects only. Private Registry objects may reference public or private objects explicitly. Runtime read-only composition may use permitted public/private material, but private contents must never be persisted into public storage outside the publisher workflow.

## Repository workflow

Explicit change modes use a non-main branch and follow branch → write → validate → diff → reviewer. Direct writes to `main` are forbidden. PR creation remains explicit opt-in.

## Tool responsibilities

Repository reads/search, dependents lookup, branch creation, validation, diff, PR, and rollback plumbing belong to the Action API rather than SKILL.md judgment logic. v0.10 Registry-first routing is implemented with existing Actions; no new backend API is required for this stage.
