---
name: skill-factory-orchestrator
description: Route Agent Skill Factory requests across read-only behavior and explicit Registry mutation modes; enforce mutation authorization, visibility-aware Registry-first planning, Candidate Skill Inspection, Reuse Boundary Check, runtime discovery/composition, and progressive disclosure.
---

# Mission

Coordinate the Skill Factory without absorbing specialist responsibilities. GitHub-backed Factory modules and Agent Skills are the source of truth.

Skill = standalone reusable capability; Flow = saved reusable execution plan; Suite = non-owning discovery/context relationship; compose = runtime-generated temporary execution plan.

Never move a Skill under a Suite, treat Suite membership as ownership, or inject Suite policy into standalone Skill use.

# Modes and Creation Gate

Classify the request first. Read-only `use`, `audit`, and ordinary/meta bypass the Creation Gate and must not mutate repositories. Mutation-oriented `create`, `refactor`, `split`, `merge`, `publish`, and `rollback` require explicit creation/change intent before persistence.

Normal task execution is not mutation authorization. Failed discovery during ordinary execution must fall back to model/tool/dynamic compose, never implicit create. There is no automatic Skillizer path.

# Routing

1. Determine mode/behavior.
2. `use` → runtime routing, read-only.
3. `audit` → reviewer + target evidence, read-only.
4. ordinary/meta → read-only response.
5. `create` → Creation Gate → Registry Search → Candidate Skill Inspection → Reuse Boundary Check → Capability Gap Plan → architect → author → reviewer.
6. `refactor` → Creation Gate → reviewer → responsibility/contract/dependents → architect if boundaries change → author → reviewer.
7. `split`/`merge` → Creation Gate → architect → author → reviewer.
8. `publish` → Creation Gate → publisher → reviewer.
9. `rollback` → Creation Gate → history → validate/review.

# Registry-first create pipeline

## Registry Search

Decompose the requested reusable outcome into capabilities and search legal Registry scopes before authoring.

- private target: search private + public Skills; for multi-capability/end-to-end requests, search private + public Flows. Private objects may reuse public/private objects.
- public target: search public Skills/Flows for direct reuse. Never author public→private dependencies; private source material requires publisher/public-safe handling.
- target visibility unresolved: do not finalize gaps after searching only one Registry. Gather sufficient public/private evidence and make visibility explicit before authoring/writes.

Search results identify candidates; they do not prove a gap.

## Candidate Skill Inspection

When search returns a strong candidate for a requested capability, call `getSkill` and inspect the current SKILL.md before finalizing any `reuse`/`extend`/`create` decision.

Inspect at least:

- responsibility / scope;
- trigger / non-trigger;
- workflow and supported modes;
- review/diagnostic/revision stages;
- inputs / outputs;
- quality gate;
- failure modes;
- handoff semantics;
- explicit boundary/non-split statements.

Do not decide from name/description alone. A capability can already be owned as a workflow step, review stage, diagnostic stage, supported mode, or output variant even when it is not named in the Skill title.

Load extra Skill resources only when SKILL.md indicates they are necessary to resolve the boundary question.

## Reuse Boundary Check

Run before Capability Gap Plan finalization for every proposed new Skill capability.

### Existing Skill already owns the capability

If an inspected candidate legitimately includes the capability inside its coherent responsibility—as a supported mode, workflow/sub-step, review/diagnostic stage, or output variant—use `reuse`. Do not carve that internal sub-responsibility into a new Skill.

If one existing Skill already owns the complete requested reusable workflow, reuse that Skill alone; do not create a Flow simply to mirror its internal stages.

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

For every capability record internally:

- `capability`;
- `disposition`: `reuse` / `extend` / `create` / `model` / `external_tool`;
- `candidateSkills`;
- `inspectedCandidates`;
- `boundaryDecision`;
- `supportingEvidence`;
- `splitJustification` when `create`;
- `targetVisibility`;
- `searchedScopes`.

A `create` disposition is blocked unless `splitJustification` explains why the capability is not an existing Skill's internal/sub-responsibility and demonstrates an independent goal, output, and reuse case.

Default away from create. Description-level search alone is insufficient evidence for create when a strong candidate exists.

## Extension safety

For any persisted existing-Skill change, inspect responsibility, trigger/non-trigger, inputs/outputs, quality gate, handoff, and failure modes. When `getRegistryDependents` is available:

- public Skill → inspect public + private dependents;
- private Skill → inspect private dependents.

Dependents inform backward compatibility; they are not an automatic veto. Contract-breaking changes require explicit refactor rather than silent extend.

## Flow-first reusable multi-capability design

- single coherent reusable responsibility → Skill;
- reusable known multi-capability process → Flow + independently reusable Skills;
- temporary multi-Skill execution → dynamic compose.

Apply Reuse Boundary Check first. Flow-first must not decompose one existing Skill's intentionally unified workflow into duplicate sub-Skills.

## Flow v1 representability guard

Flow v1 supports only `exact_skill` and Skill-discovered `capability`. Required `model`/`external_tool` capabilities without a legitimate Skill representation block Flow authoring as `unsupported_flow_capability` or equivalent. Do not omit required steps, create fake schema-fitting Skills, hide external tools inside Skills, or invent unsupported step types.

# Use runtime

Exact, discover, recommend, compose, saved Flow execution, Suite scope, and ordinary/meta behavior remain unchanged and read-only.

For discover, search and load the best existing Skill when appropriate. If none matches, fall back to model/tool/dynamic compose without create.

For compose, choose the smallest sufficient Skill set. Do not compose merely because a Skill has multiple internal workflow stages. If one Skill owns review → diagnosis → revision as one responsibility, use that Skill rather than splitting the stages.

# Repository policy

- GitHub Action reads are authoritative.
- Read-only behavior never mutates repositories.
- Mutation modes use non-main branches and branch → write → validate → diff → reviewer.
- Never write directly to main.
- PR creation remains explicit opt-in.
- Public/private boundaries remain unchanged.

# Progressive disclosure

Explicit create loads in this order:

orchestrator → Registry Search → strong candidate SKILL.md inspection → Reuse Boundary Check → Capability Gap Plan → required candidate/dependent evidence → architect → author → reviewer.

Do not load Architect/Author when reuse fully satisfies the requested reusable outcome.

# Definition of done

A create route is ready for authoring only when candidate inspection went beyond description-level metadata, Reuse Boundary Check is complete, create decisions contain valid split justification, partial fits considered extend, explicit non-split boundaries are preserved, visibility/dependent rules are satisfied, and no existing coherent Skill workflow is being duplicated as new Skills/Flow.
