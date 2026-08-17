# Flow / Suite Registry v1 regression matrix

These cases are the required reviewer/E2E contract. They are designed to be executable against a deployed branch API plus representative public/private fixture registries. Repository-only review can verify structural cases but must label deployed API/runtime cases unexecuted rather than passed.

| # | Case | Expected |
|---|---|---|
| 1 | `$skill-name` exact invocation | Direct Skill resolution; no Flow search/policy injection |
| 2 | Existing implicit single-Skill discovery | Same `searchSkills()` ranking/scoring as main |
| 3 | Existing Skill recommendation | Skill candidates only unless Flow/Suite requested |
| 4 | Existing uncovered multi-responsibility task | Dynamic compose remains available |
| 5 | Local CTA-only edit while broad LP Flow exists | Skill, not Flow |
| 6 | Known end-to-end LP creation with strongly matching Flow | Flow eligible/selected |
| 7 | Multi-responsibility task with no adequate Flow | compose |
| 8 | Standalone Skill that is a Suite member | No Suite policy injected |
| 9 | Same Skill referenced by two Suites | Both Suites validate |
| 10 | Exact Flow step Skill unavailable | Step/Flow failure; no substitute Skill |
| 11 | Capability Flow step | Dynamic `searchSkills` resolution; compose allowed only when declared/needed |
| 12 | Exact reference to nonexistent Skill | Flow validation fails |
| 13 | A depends on B and B depends on A | Flow validation fails cycle detection |
| 14 | Public Flow/Suite references private member | Validation fails without leaking private repo data |
| 15 | Optional condition false | Step skipped and completion can still succeed if not otherwise required/applicable |
| 16 | User excludes applicable required step | `assessFlowCompletion` reports not ok |
| 17 | `searchSkills()` before/after same query/registry | Results identical; Flow/Suite search is separate |
| 18 | list/get/search/validate/history for Flow/Suite | Routes work; canonical objects returned |
| 19 | Existing API routes and `target=skill` | Remain accepted; `registry` also accepted for repository operations |
| 20 | Public/private repositories | Existing boundary retained; public manifest cannot reference private object |
| 21 | FLOW.json outside `flows/<name>/FLOW.json` | Registry path guard rejects |
| 22 | SUITE.json outside `suites/<name>/SUITE.json` | Registry path guard rejects |
| 23 | Duplicate step id/dependency/output/member | Validator rejects |
| 24 | Handoff from nondependency/undeclared output | Validator rejects |
| 25 | Condition containing object/array/code-like nested value | Validator rejects |
| 26 | Flow step type `flow` / recursive nesting | Validator rejects in v1 |
| 27 | Delete path outside Registry roots using registry target | General Registry path guard rejects |
| 28 | Public Flow capability step forces private visibility | Validator rejects |
| 29 | Skill target, Flow `exact_skill` name matches but effective visibility differs | Not returned as a dependency |
| 30 | Private Flow exact Skill omits visibility | Effective visibility is private; matches only private target identity |
| 31 | Private Flow exact Skill explicitly uses `visibility: public` | Effective visibility is public; matches public target identity |
| 32 | Skill name appears only in capability query or metadata text | Not returned as a dependency |
| 33 | Skill target appears in Suite `members.skills` | Returned as `suite_skill_member` with member index and effective visibility |
| 34 | Flow target appears in Suite `members.flows` | Returned as `suite_flow_member` with member index and effective visibility |
| 35 | Public target dependency scan across public/private Registries | Requires two explicit calls, each with its own dependent visibility and ref; no implicit cross-Registry scan |
| 36 | `getRegistryDependents` request | Read-only GET; response contains dependent identity, manifest path, reference kind/location, referenced name, explicit visibility state/value, and effective visibility |

Reviewer must explicitly state whether each class is statically verified, executed E2E, unexecuted, or failed.
