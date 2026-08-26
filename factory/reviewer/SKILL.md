---
name: skill-reviewer
description: Audit Agent Skill packages and Factory changes for correctness, Registry-first build semantics, mutation authorization, placement, progressive disclosure, boundaries, contracts, eval coverage, security, validation, and regression risk before PR or publication.
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

- responsibility is coherent and not overloaded with SEO, fact-checking, LLMO, article planning, or other unrelated capabilities unless they are genuinely the same reusable responsibility;
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

Expect behavior coverage appropriate to the Skill, including:

- positive trigger;
- implicit trigger when natural language invocation matters;
- explicit trigger;
- negative trigger;
- near-miss;
- known-good;
- known-bad;
- regressions for prior failures.

## Safety and repository policy

- validateSkill passes;
- secret scan passes;
- public/private boundary is preserved;
- read-only use/audit work caused no repository mutation;
- PR creation matches explicit user authorization.

# Registry-first Build Pipeline review — v0.10

Review these as independent checks for every relevant Factory/Registry change. A failure in any applicable item is blocking:

1. **Ordinary-task mutation:** ordinary task execution did not create/change/persist Skill, Flow, or Suite state.
2. **Mutation authorization:** no Registry object was persisted without explicit creation/change intent; read-only `use`, `audit`, and ordinary/meta did not require the Creation Gate.
3. **Create ordering:** for explicit create, Registry Search occurred before Architect/Author and included Flow search when the reusable request was multi-capability/end-to-end.
4. **Capability Gap Plan:** required capabilities were explicitly classified as `reuse`, `extend`, `create`, `model`, or `external_tool` before authoring.
5. **Duplicate avoidance:** no blind duplicate Skill was created when an existing Skill adequately covered the responsibility.
6. **Extension evidence:** before any persisted existing-Skill change, responsibility/contract was inspected and, when `getRegistryDependents` was available, required dependents were checked (public target: public + private; private target: private).
7. **Breaking-change handling:** a contract/meaning-breaking change was not silently treated as `extend`; it was separated or routed to explicit refactor.
8. **Flow-first design:** reusable known multi-capability processes considered Flow + independently reusable Skills rather than one giant Skill.
9. **All-capabilities-existing case:** when all required Skills already existed, no unnecessary new Skill was authored; at most missing explicit reusable orchestration justified a Flow.
10. **Compose persistence boundary:** temporary dynamic compose was not automatically persisted as a Flow without explicit user creation intent.

Dependent existence alone is not a pass/fail criterion for extension. Review whether dependent evidence was actually used to assess backward compatibility and migration risk.

# Flow package checks

For a completed Flow, verify:

- canonical `flows/<name>/FLOW.json` placement and directory/name match;
- valid JSON/schema and v1 DAG;
- unique step ids, existing dependencies, and no cycles;
- exact Skill references exist and are never silently substituted;
- capability definitions remain dynamically resolvable;
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

For Registry-first v0.10 routing, additionally regression-check:

- read-only `audit` remains directly reachable without Creation Gate and without repository mutation;
- failed ordinary-task Skill discovery falls back to model/tool/dynamic compose and never transitions into create;
- mutation-oriented modes require explicit authorization before persistence;
- extension dependent-scope rules preserve the public/private boundary.

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
11. capability Flow steps may resolve dynamically;
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

Return PASS only when no blocking correctness, security, placement, boundary, mutation-authorization, Registry-first pipeline, or regression issue remains. Distinguish unexecuted E2E checks from actual failures.
