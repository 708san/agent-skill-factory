---
name: skill-reviewer
description: Audit completed Agent Registry and Factory changes for Skill/Flow/Suite correctness, routing compatibility, placement, contracts, eval coverage, security, validation, and regression risk before PR or publication.
---

# Mission

Review the complete changed package and diff. Report blocking issues clearly and distinguish actual failures from E2E checks that were not executable in the current environment.

# Skill compatibility checks

Verify:

- Skills remain independent first-class objects under `skills/<name>/`;
- exact Skill invocation semantics are unchanged;
- `searchSkills` discovery/scoring is not polluted by Flow/Suite search;
- recommend behavior remains Skill-compatible;
- standalone member Skill execution receives no Suite policy injection;
- one Skill can be referenced by multiple Suites;
- existing dynamic compose remains available and is not replaced by Flow routing.

Apply existing Skill placement, progressive disclosure, boundary, contract, eval, and safety checks.

# Flow checks

Verify:

- canonical `flows/<name>/FLOW.json` placement and name match;
- valid v1 JSON/schema and DAG;
- unique step ids, existing dependencies, and no cycles;
- exact Skill references exist and are never silently substituted;
- capability definitions are valid and remain dynamically resolvable;
- handoff sources and expected outputs are consistent;
- duplicate/conflicting outputs are rejected;
- conditions are limited to declarative `when` equality checks;
- completion requires all applicable required steps;
- excluding a required applicable step prevents full success;
- Flow→Flow recursion is rejected in v1;
- Flow contains orchestration semantics, not copied Skill How/prompt text;
- public Flow cannot reference private objects.

# Suite checks

Verify:

- canonical `suites/<name>/SUITE.json` placement and name match;
- member Skill/Flow references exist and contain no duplicates;
- membership is non-owning and reusable across Suites;
- policy/gates/contracts are applied only in explicit Suite/Flow context;
- Suite is used as discovery scope rather than a normal executable target;
- public Suite cannot reference private objects.

# Routing regression checks

Explicitly review these outcomes:

1. existing exact Skill invocation unchanged;
2. existing discover Skill unchanged;
3. existing recommend unchanged;
4. existing compose unchanged;
5. local/single-responsibility requests are not absorbed by Flows;
6. strongly matching known end-to-end requests may select a Flow;
7. uncovered multi-responsibility requests use compose;
8. standalone Suite-member Skill receives no Suite policy;
9. one Skill may belong to multiple Suites;
10. exact Flow step is not substituted;
11. capability step may resolve dynamically;
12. nonexistent exact Skill rejected;
13. dependency cycle rejected;
14. public Flow/Suite→private rejected;
15. optional condition behavior is correct;
16. excluded required step prevents full-success claim;
17. `searchSkills` results/scoring have no unnecessary regression;
18. Flow/Suite read/search/write/validate/history paths exist;
19. legacy API routes and `target=skill` alias remain available;
20. public/private repository boundary remains intact.

# Factory change review

Check implementation and instructions agree, generalized Registry path guards cover write and delete without removing the legacy Skill path API, JSON parsing adds no unnecessary dependency, and OpenAPI sources describe the same routes/aliases.

# Safety and workflow

Require non-main branch, validation, secret scan, diff inspection, and reviewer pass. PR creation must match explicit authorization.

# Decision

Return PASS only when no blocking correctness, security, placement, boundary, routing, or regression issue remains. State unexecuted E2E checks separately from failures.
