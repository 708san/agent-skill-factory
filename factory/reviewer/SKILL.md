---
name: skill-reviewer
description: Audit Agent Skill packages and Factory changes for correctness, Registry-first build semantics, mutation authorization, visibility-aware search, Candidate Skill Inspection, Reuse Boundary Check, Flow representability, placement, boundaries, contracts, eval coverage, security, validation, and regression risk.
---

# Mission

Review the complete changed package and diff, not only SKILL.md. Report blocking issues clearly and do not modify files unless the user requested refactor/change mode.

# Required Skill package checks

For a completed Skill, verify:

## Placement

- all package files are under `skills/<skill-name>/`;
- required `skills/<skill-name>/SKILL.md` exists;
- no root-level `<skill-name>/` package remains;
- no absolute path, traversal, or accidental cross-Skill write exists.

## Progressive Disclosure

- SKILL.md contains the core workflow and critical decisions;
- long rubrics, pattern lists, medium/industry guidance, detailed checklists, and long examples are externalized when conditional;
- essential decision rules have not been moved out so aggressively that ordinary execution requires every reference;
- SKILL.md explicitly says when each reference should be loaded;
- no unused or duplicative reference exists;
- a SKILL.md above roughly 150–200 lines received an explicit disclosure review rather than an automatic split.

## Skill boundary

- responsibility is coherent and not overloaded with unrelated capabilities unless genuinely the same reusable responsibility;
- a natural core workflow has not been fragmented into unnecessary micro-Skills;
- trigger and non-trigger are clear.

## Contract and composition readiness

Check when relevant:

- responsibility;
- inputs and outputs;
- quality gate;
- handoff_in / handoff_out semantics;
- failure modes;
- loose coupling to upstream/downstream Skills.

## Evals

Expect behavior coverage appropriate to the Skill, including positive trigger, implicit trigger when relevant, explicit trigger, negative trigger, near-miss, known-good, known-bad, and regressions for prior failures.

## Safety and repository policy

- validateSkill passes;
- secret scan passes;
- public/private boundary is preserved;
- read-only use/audit work caused no repository mutation;
- PR creation matches explicit user authorization.

# Registry-first Build Pipeline review — v0.10 + Reuse Boundary Check v1

Review these as independent checks for every relevant Factory/Registry change. A failure in any applicable item is blocking:

1. **Ordinary-task mutation:** ordinary task execution did not create/change/persist Skill, Flow, or Suite state.
2. **Mutation authorization:** no Registry object was persisted without explicit creation/change intent; read-only `use`, `audit`, and ordinary/meta did not require Creation Gate.
3. **Pipeline ordering:** explicit create followed Registry Search → Candidate Skill Inspection → Reuse Boundary Check → Capability Gap Plan before Architect/Author.
4. **Visibility-aware search:** target visibility was explicit before authoring/writes; private targets searched public + private Skills/Flows as applicable; public direct reuse used public objects and did not create public→private dependencies.
5. **Strong candidate inspection:** every strong candidate relevant to a new-Skill proposal had current SKILL.md inspected with `getSkill`; description-level search alone is insufficient.
6. **Boundary evidence:** inspection covered responsibility/scope, trigger/non-trigger, workflow/supported modes, review/diagnostic/revision stages, inputs/outputs, quality gate, failure modes, handoff, and explicit non-split/boundary statements when present.
7. **Internal sub-step duplication:** no new Skill duplicates a supported mode, workflow step, review/diagnostic stage, or output variant already owned by an existing coherent Skill.
8. **Explicit non-split rule:** no ordinary create violates `do not split`, `keep X and Y in one workflow`, or equivalent boundary. Such a change requires explicit refactor/split.
9. **Partial-fit handling:** an 80–90% or otherwise natural partial fit considered `extend` before `create`, with contract/dependent/backward-compatibility analysis for persisted change.
10. **Create split justification:** every `create` contains `splitJustification` proving independent user goal, independently useful output, independent reuse value, and that the capability is not an inspected Skill's internal sub-responsibility.
11. **Gap evidence:** Capability Gap Plan records `capability`, `disposition`, `candidateSkills`, `inspectedCandidates`, `boundaryDecision`, `supportingEvidence`, `splitJustification` for create, `targetVisibility`, and `searchedScopes`.
12. **Duplicate avoidance:** no blind duplicate Skill was created when an existing legal Skill adequately covered the responsibility.
13. **Extension evidence:** before any persisted existing-Skill change, responsibility/contract was inspected and, when `getRegistryDependents` was available, required dependents were checked (public Skill: public + private; private Skill: private).
14. **Breaking-change handling:** a contract/meaning-breaking change was not silently treated as `extend`; it was separated or routed to explicit refactor.
15. **Flow-first design:** reusable known multi-capability processes considered Flow + independently reusable Skills, but one existing Skill's coherent internal workflow was not externalized into a Flow plus duplicate sub-Skills.
16. **All-capabilities-existing case:** when all required Skills already existed, no unnecessary new Skill was authored; when one existing Skill owns the entire coherent requested workflow, no unnecessary Flow was authored either.
17. **Compose persistence boundary:** temporary dynamic compose was not automatically persisted as a Flow without explicit creation intent.
18. **Flow v1 representability:** every authored Flow required step is representable as current `exact_skill` or Skill-resolved `capability`; required `model`/`external_tool` gaps lacking a legal independently justified Skill representation block authoring as `unsupported_flow_capability` or equivalent.
19. **No representability distortion:** design did not silently omit required Flow capabilities, create unnecessary schema-fitting Skills, bury external-tool responsibilities inside Skills, or emit unsupported step types.

Dependent existence alone is not a pass/fail criterion for extension. Review whether dependent evidence was actually used to assess backward compatibility and migration risk.

# Flow package checks

For a completed Flow, verify:

- canonical `flows/<name>/FLOW.json` placement and directory/name match;
- valid JSON/schema and v1 DAG;
- unique step ids, existing dependencies, and no cycles;
- exact Skill references exist and are never silently substituted;
- capability definitions remain dynamically resolvable through Skill discovery;
- every step type is one supported by current Flow v1;
- no required model-native/external-tool capability was silently omitted or disguised as an unrelated Skill;
- handoff sources and expected outputs are consistent;
- duplicate/conflicting outputs are rejected;
- conditions are limited to declarative `condition.when` equality checks;
- completion requires all applicable required steps;
- excluding an applicable required step prevents full success;
- Flow → Flow recursion is rejected in v1;
- Flow contains orchestration semantics rather than copied Skill How/prompt text;
- public Flow does not reference private objects.

# Suite package checks

For a completed Suite, verify:

- canonical `suites/<name>/SUITE.json` placement and directory/name match;
- member Skill/Flow references exist and contain no duplicates;
- membership is non-owning and one member may be reused by multiple Suites;
- policy/gates/contracts apply only in explicit Suite/Flow context;
- Suite is a discovery scope rather than a normal executable target;
- public Suite does not reference private objects.

# Factory change review

For runtime/Factory changes, verify existing modes and routes remain available, new behavior is covered by evals, implementation and instructions agree, and code guards enforce structural invariants when practical.

For Registry-first v0.10 + Reuse Boundary Check routing, additionally regression-check:

- read-only `audit` remains directly reachable without Creation Gate and without repository mutation;
- failed ordinary-task Skill discovery falls back to model/tool/dynamic compose and never transitions into create;
- mutation-oriented modes require explicit authorization before persistence;
- Registry Search visibility scope is correct and gap plans carry scope evidence;
- Registry-first does not stop at name/description search when strong candidates exist;
- strong candidate SKILL.md is read before new-Skill creation;
- existing Skill workflow/sub-step is not duplicated;
- explicit non-split boundaries are honored;
- partial fits evaluate extend;
- create splitJustification proves independent responsibility;
- reuse of one coherent Skill does not trigger an unnecessary Flow;
- extension dependent-scope rules preserve the public/private boundary;
- Flow v1 representability is fail-closed before Author.

For Flow/Suite Factory changes, explicitly regression-check:

1. existing exact Skill invocation remains unchanged;
2. existing discover Skill behavior remains unchanged;
3. existing recommend behavior remains unchanged;
4. existing compose remains dynamic and available;
5. local/single-responsibility requests are not absorbed by Flows;
6. strongly matching known end-to-end requests may select a Flow;
7. uncovered multi-responsibility requests use compose;
8. standalone Suite-member Skill receives no Suite policy;
9. one Skill may be referenced by multiple Suites;
10. exact Flow steps are not substituted;
11. capability Flow steps may resolve dynamically through Skills;
12. nonexistent exact Skill references are rejected;
13. dependency cycles are rejected;
14. public Flow/Suite → private references are rejected;
15. optional conditions behave declaratively;
16. excluded applicable required steps prevent full-success claims;
17. `searchSkills` results/scoring are not polluted by Flow/Suite discovery;
18. Flow/Suite read/search/write/validate/history paths exist;
19. legacy API routes and `target=skill` repository semantics remain available;
20. public/private repository boundaries remain intact.

Also verify generalized Registry write/delete path guards preserve valid existing Skill paths, Flow/Suite JSON uses no unnecessary parser dependency, and `api/openapi.js` / `gpt/openapi.yaml` stay aligned without deleting existing API contracts.

# Decision

Return PASS only when no blocking correctness, security, placement, boundary, mutation-authorization, visibility-search, Candidate Skill Inspection, Reuse Boundary Check, Flow-representability, or regression issue remains. Distinguish unexecuted E2E checks from actual failures.
