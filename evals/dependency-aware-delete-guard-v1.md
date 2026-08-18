# Dependency-aware delete guard v1 regression matrix

The guard applies only to primary Registry object deletion: `skills/<name>/SKILL.md` and `flows/<name>/FLOW.json`. It never rewrites references.

| Case | Setup | Expected |
|---|---|---|
| A | Public Skill ← Public Flow exact dependent | delete blocked; public scan reports dependent |
| B | Public Skill ← Private Flow with explicit `visibility: public` | delete blocked; private scan reports dependent |
| C | Public Flow ← Public or Private Suite member | delete blocked in corresponding scan |
| D | Private Skill ← Private Flow exact dependent | delete blocked by private scan |
| E | Primary Skill/Flow with no dependents and all required refs valid | preflight safe; existing delete path may proceed |
| F | Public primary delete without `dependencyRefs.privateRef` | 409 blocked; no delete call |
| G | Public primary delete with invalid private ref | 409 blocked as incomplete scan; never interpreted as zero dependents |
| H | GitHub/ref/dependency scan error | fail closed; 409 blocked; no delete call |
| I | `skills/<name>/references/foo.md`, scripts/assets/evals or other non-primary file | no dependency preflight; existing delete semantics preserved |
| J | Existing Skill/Flow/Suite list/get/search/validate | unchanged |
| K | `getRegistryDependents` | unchanged/read-only |
| L | Existing branch/write/history/compare/PR APIs | unchanged |
| M | `suites/<name>/SUITE.json` deletion | no v1 dependency preflight because Suite is not a reverse-dependency target |
| N | Factory file deletion | no Registry dependency preflight |

## Fail-closed invariants

- Public primary Skill/Flow deletion requires a successful public dependency scan at the delete branch and a successful private dependency scan at explicit `dependencyRefs.privateRef`.
- Private primary Skill/Flow deletion requires a successful private dependency scan at the delete branch.
- Every required scan first proves the requested ref exists in the corresponding repository through GitHub commit lookup.
- A missing ref, invalid ref, lookup error, scan error, or any dependent blocks deletion before `deleteTextFile`.
- No force/ignore/unsafe override exists in v1.
