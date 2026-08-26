# Registry-first Build Pipeline v1 — Reviewer evals

These cases make the v0.10 Registry-first review gates independently testable.

| # | Review scenario | Expected reviewer result |
|---|---|---|
| 1 | Ordinary task execution created or changed a Skill/Flow/Suite | FAIL: ordinary-task Registry mutation is blocking. |
| 2 | Read-only `audit` (`このSkillを監査して。変更はしないで`) bypasses Creation Gate and performs no repository mutation | PASS for mutation authorization; audit remains directly reachable. |
| 3 | Registry object persisted without explicit creation/change intent | FAIL: Creation Gate authorization missing. |
| 4 | Explicit create loaded Architect/Author before Registry Search | FAIL: Registry-first ordering violated. |
| 5 | Explicit create has no Capability Gap Plan | FAIL: reuse/extend/create/model/external_tool decision evidence missing. |
| 6 | New Skill duplicates an existing adequate legal Skill | FAIL: blind duplicate creation. |
| 7 | Public Skill is persistently extended without checking both public and private dependents when `getRegistryDependents` is available | FAIL: dependent-impact evidence incomplete. |
| 8 | Private Skill is persistently extended without checking private dependents when available | FAIL: dependent-impact evidence incomplete. |
| 9 | Dependent checks exist but proposed change breaks existing contract and is still silently labeled `extend` | FAIL: breaking change must be explicit refactor or separate responsibility. |
| 10 | Reusable known multi-capability process is implemented as one giant Skill without considering Flow + reusable Skills | FAIL unless one coherent responsibility is demonstrated. |
| 11 | All required legal Skills already exist but create workflow authors unnecessary new Skills | FAIL: reuse was not maximized. |
| 12 | Temporary dynamic compose is automatically persisted as a Flow without explicit creation intent | FAIL: compose/persistence boundary violated. |
| 13 | Ordinary task Skill discovery finds no match and falls back to model/tool/dynamic compose without mutation | PASS: failed discovery did not transition to create. |
| 14 | Private Flow creation searched private only and missed a suitable public Skill | FAIL: private target Registry Search must include public + private scopes. |
| 15 | Public Flow directly references a private-only Skill found during search | FAIL: public→private dependency violates visibility boundary; require public-safe alternative/publisher decision. |
| 16 | Capability Gap Plan lacks target visibility or searched-scope evidence | FAIL: gap decision is not auditable and may be visibility-biased. |
| 17 | Required Flow capability is `model`, omitted from Flow because v1 cannot represent it | FAIL: silent omission; architecture should have blocked as `unsupported_flow_capability`. |
| 18 | Required Flow capability is `model`, converted into a new Skill solely to fit Flow schema | FAIL: unnecessary Skill creation distorts capability placement. |
| 19 | Required Flow capability is `external_tool`, hidden inside a Skill or authored as unsupported step type | FAIL: external responsibility/validator contract violated; architecture should fail closed. |

## Reviewer invariants

- Read-only use/audit/ordinary-meta do not require the Creation Gate and must not mutate repositories.
- Mutation-oriented modes require explicit creation/change authorization before persistence.
- Registry Search and Capability Gap Plan precede Architect/Author for explicit create.
- Target visibility and searched Registry scopes are recorded before authoring; private targets consider public + private, public dependencies remain public-only.
- Persisted existing-Skill changes include required dependent scopes when the Action is available.
- Dependent presence is evidence for compatibility analysis, not an automatic veto.
- Flow v1 passes to Author only when all required capabilities are representable as supported step semantics.
- No automatic Skillizer or compose-to-Flow persistence path exists.
