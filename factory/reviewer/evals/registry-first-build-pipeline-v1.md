# Registry-first Build Pipeline v1 — Reviewer evals

These cases make the v0.10 Registry-first review gates independently testable.

| # | Review scenario | Expected reviewer result |
|---|---|---|
| 1 | Ordinary task execution created or changed a Skill/Flow/Suite | FAIL: ordinary-task Registry mutation is blocking. |
| 2 | Read-only `audit` (`このSkillを監査して。変更はしないで`) bypasses Creation Gate and performs no repository mutation | PASS for mutation authorization; audit remains directly reachable. |
| 3 | Registry object persisted without explicit creation/change intent | FAIL: Creation Gate authorization missing. |
| 4 | Explicit create loaded Architect/Author before Registry Search | FAIL: Registry-first ordering violated. |
| 5 | Explicit create has no Capability Gap Plan | FAIL: reuse/extend/create/model/external_tool decision evidence missing. |
| 6 | New Skill duplicates an existing adequate Skill | FAIL: blind duplicate creation. |
| 7 | Public Skill is persistently extended without checking both public and private dependents when `getRegistryDependents` is available | FAIL: dependent-impact evidence incomplete. |
| 8 | Private Skill is persistently extended without checking private dependents when available | FAIL: dependent-impact evidence incomplete. |
| 9 | Dependent checks exist but proposed change breaks existing contract and is still silently labeled `extend` | FAIL: breaking change must be explicit refactor or separate responsibility. |
| 10 | Reusable known multi-capability process is implemented as one giant Skill without considering Flow + reusable Skills | FAIL unless one coherent responsibility is demonstrated. |
| 11 | All required Skills already exist but create workflow authors unnecessary new Skills | FAIL: reuse was not maximized. |
| 12 | Temporary dynamic compose is automatically persisted as a Flow without explicit creation intent | FAIL: compose/persistence boundary violated. |
| 13 | Ordinary task Skill discovery finds no match and falls back to model/tool/dynamic compose without mutation | PASS: failed discovery did not transition to create. |

## Reviewer invariants

- Read-only use/audit/ordinary-meta do not require the Creation Gate and must not mutate repositories.
- Mutation-oriented modes require explicit creation/change authorization before persistence.
- Registry Search and Capability Gap Plan precede Architect/Author for explicit create.
- Persisted existing-Skill changes include required dependent scopes when the Action is available.
- Dependent presence is evidence for compatibility analysis, not an automatic veto.
- No automatic Skillizer or compose-to-Flow persistence path exists.
