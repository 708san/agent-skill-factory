---
name: skill-reviewer
description: Audit Agent Skill packages and Factory changes for correctness, Registry-first build semantics, mutation authorization, visibility-aware search, Candidate Skill Inspection, Reuse Boundary Check, Flow representability, contracts, eval coverage, security, and regression risk.
---

# Mission

Review the complete changed package and diff. Report blocking issues clearly and do not modify files unless the user requested a change mode.

# Core package checks

Verify canonical placement, coherent responsibility, trigger/non-trigger clarity, explicit contracts/handoffs/failure modes, appropriate progressive disclosure, eval coverage, secret scan/validation, public/private boundary, read-only safety, and explicit PR authorization.

# Registry-first Build Pipeline review — v0.10 + Reuse Boundary Check v1

Review these as independent blocking checks when applicable:

1. **Ordinary-task mutation:** ordinary task execution did not persist Registry state.
2. **Mutation authorization:** no persistence without explicit creation/change intent; read-only use/audit/meta bypass Creation Gate.
3. **Pipeline ordering:** explicit create followed Registry Search → Candidate Skill Inspection → Reuse Boundary Check → Capability Gap Plan before Architect/Author.
4. **Visibility-aware search:** target visibility and searched scopes are correct; private targets consider public + private, public direct dependencies remain public-only.
5. **Strong candidate inspection:** every strong candidate Skill relevant to a new-Skill proposal had its current SKILL.md inspected with `getSkill`; description-level search alone is insufficient.
6. **Boundary evidence:** candidate inspection covered responsibility/scope, trigger/non-trigger, workflow, inputs/outputs, quality gate, failure modes, handoff, and explicit non-split/boundary statements when present.
7. **Internal sub-step duplication:** no new Skill duplicates a supported mode, workflow step, review/diagnostic stage, or output variant already owned by an existing coherent Skill.
8. **Explicit non-split rule:** no ordinary create violates `do not split`, `keep X and Y in one workflow`, or equivalent boundary. Such a change requires explicit refactor/split.
9. **Partial-fit handling:** an 80–90% or otherwise natural partial fit considered `extend` before `create`, with contract/dependent/backward-compatibility analysis for persisted change.
10. **Create split justification:** every `create` contains `splitJustification` proving independent user goal, independently useful output, independent reuse value, and that the capability is not an inspected Skill's internal sub-responsibility.
11. **Gap evidence:** Capability Gap Plan records capability, disposition, candidateSkills, inspectedCandidates, boundaryDecision, supportingEvidence, splitJustification for create, targetVisibility, and searchedScopes.
12. **Duplicate avoidance:** no blind duplicate Skill creation.
13. **Extension evidence:** persisted existing-Skill changes inspect responsibility/contract and required dependents (public target: public + private; private target: private) when available.
14. **Breaking-change handling:** contract/meaning-breaking changes are not silent extend.
15. **Flow-first design:** reusable genuinely multi-capability processes consider Flow + independent Skills, but one existing Skill's coherent internal workflow is not externalized into a Flow plus duplicate sub-Skills.
16. **All-capabilities-existing case:** no unnecessary new Skill; if one existing Skill already owns the complete requested workflow, no unnecessary Flow either.
17. **Compose persistence boundary:** temporary dynamic compose is not automatically persisted.
18. **Flow v1 representability:** required `model`/`external_tool` gaps without a legal independently justified Skill representation block Flow authoring; no omitted steps, schema-fitting fake Skills, hidden tools, or unsupported step types.

Dependents are compatibility evidence, not an automatic veto.

# Flow/Suite regression checks

Preserve exact Skill invocation, discover, recommend, dynamic compose, saved Flow execution, Suite contextual scope, Flow exact/capability semantics, no Flow recursion in v1, public/private references, completion semantics, legacy Registry routes, and v0.9.0 hardening behavior.

# Reuse Boundary regression focus

For Factory/runtime changes, specifically verify:

- Registry-first does not stop at name/description search when strong candidates exist;
- strong candidate SKILL.md is read before new-Skill creation;
- existing Skill workflow/sub-step is not duplicated;
- explicit non-split boundaries are honored;
- partial fits evaluate extend;
- create splitJustification proves independent responsibility;
- reuse of one coherent Skill does not trigger an unnecessary Flow.

# Decision

Return PASS only when no blocking correctness, security, boundary, mutation-authorization, visibility-search, Candidate Skill Inspection, Reuse Boundary Check, Flow-representability, or regression issue remains. Distinguish unexecuted E2E from actual failures.
