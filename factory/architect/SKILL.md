---
name: skill-architect
description: Design Registry-first Skill/Flow/Suite changes after mutation authorization, visibility-aware search, Candidate Skill Inspection, and Reuse Boundary Check; decide reuse, extension, creation, boundaries, contracts, dependent impact, representability, and Flow-first architecture.
---

# Mission

Design the smallest coherent Registry change that solves explicit reusable-system intent without duplicate Skills, unnecessary micro-Skills, illegal visibility dependencies, broken non-split boundaries, or unrepresentable Flows.

Architect is not the first step of create. It receives a request only after Creation Gate, Registry Search, Candidate Skill Inspection, Reuse Boundary Check, and a draft Capability Gap Plan.

# Required inputs

Before architecture require:

- explicit creation/change intent;
- requested reusable outcome;
- target object type/visibility;
- capability decomposition;
- searched Registry scopes;
- candidate Skills and which were inspected with `getSkill`;
- boundary evidence from inspected SKILL.md files;
- draft dispositions `reuse` / `extend` / `create` / `model` / `external_tool`;
- `splitJustification` for every proposed `create`;
- contract/dependent evidence for persisted existing-Skill changes.

If a strong candidate was not inspected, if target visibility is unresolved, or if create lacks split justification, return to the earlier pipeline stage rather than authoring.

# Reuse Boundary Check — architecture verification

Architect must independently verify the boundary decision before authoring.

## Existing ownership

Treat a capability as already owned when the inspected Skill legitimately contains it as:

- top-level responsibility;
- supported mode;
- workflow/sub-step;
- review or diagnostic stage;
- output variant;
- another explicitly declared part of the same coherent workflow.

Do not create a separate Skill merely because that internal stage has a describable name or output.

If one Skill already owns the entire requested workflow, prefer that Skill alone. Do not create a Flow that simply externalizes its internal stages.

## Partial fit

When an existing Skill's coherent responsibility naturally includes the requested capability but coverage is incomplete, evaluate `extend` before `create`.

For persisted extension:

1. inspect responsibility, trigger/non-trigger, workflow, inputs/outputs, quality gate, failure modes, and handoff;
2. inspect dependents when available (public target: public + private; private target: private);
3. identify backward-compatibility obligations;
4. allow extend only when the existing contract remains compatible.

## Independent responsibility test

Approve `create` only when the proposed Skill has:

- an independent user goal;
- an independently useful output;
- independent reuse value in other workflows;
- a boundary that is not merely an existing Skill's implementation/sub-step.

`splitJustification` must explicitly explain why these conditions hold and why strong inspected candidates do not already own the capability.

## Explicit non-split rule

An explicit candidate boundary such as `do not split`, `keep review and revision in one workflow`, or `X is part of this responsibility` is authoritative for ordinary create. If the proposed design would violate it, stop and route to explicit refactor/split instead of silently creating a new Skill.

# Visibility-aware search contract

- private target: search evidence from public + private Skills, and public/private Flows when relevant; private objects may reuse either.
- public target: direct reuse evidence comes from public Registry objects only; private candidates may inform publisher/public-safe alternatives but never direct public dependencies.
- unresolved visibility: architecture/authoring blocked until explicit and supported by sufficient search evidence.

# Capability Gap Plan contract

Every capability must include:

- `capability`;
- `disposition`;
- `candidateSkills`;
- `inspectedCandidates`;
- `boundaryDecision`;
- `supportingEvidence`;
- `splitJustification` for create;
- `targetVisibility`;
- `searchedScopes`.

Architect rejects `create` when inspected-candidate evidence is missing or split justification does not prove independent responsibility.

# Extension and dependent safety

Dependents are compatibility evidence, not an automatic veto. Public existing-Skill changes inspect public + private dependents when available; private changes inspect private dependents. Breaking meaning/contract is explicit refactor, not silent extend.

# Flow-first multi-capability creation

Use Flow + independently reusable Skills only for a reusable known process whose responsibilities are genuinely independent. Do not transform one candidate Skill's coherent internal workflow into a Flow plus extracted sub-Skills.

If all required independent Skills already exist, create only the Flow when reusable orchestration itself is missing. If a matching existing Flow already satisfies the outcome, create nothing.

# Flow v1 representability guard

Current Flow v1 supports only `exact_skill` and Skill-discovered `capability`. Required `model`/`external_tool` capabilities without a legitimate independent Skill representation block authoring as `unsupported_flow_capability` or equivalent.

# Boundary rules

- independent user intent + independent output + independent reuse → separate Skill candidate;
- internal stage of a coherent responsibility → keep inside existing Skill;
- conditional knowledge → reference;
- deterministic repeated processing → script;
- reusable source/template → asset;
- external state/action → external tool/API;
- regressions/examples → eval.

Multiple workflow steps alone never justify multiple Skills.

# Skill Contract

For approved new/extended Skills make responsibility, trigger/non-trigger, inputs, outputs, quality gate, handoff semantics, and failure modes explicit. Keep downstream coupling contract-based rather than upstream-Skill-name-based.

# Definition of done

Architecture is ready for Author only when strong candidates were inspected, Reuse Boundary Check proves the selected boundary, every create has a credible splitJustification, partial fits considered extension, non-split rules are preserved or explicitly refactored, visibility/dependent rules are safe, and every Flow step is representable by Flow v1.
