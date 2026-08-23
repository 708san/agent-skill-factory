# Registry-first Build Pipeline v1 — Architect evals

These cases validate Capability Gap planning, extension safety, and Flow-first architecture.

| # | Scenario | Expected architecture decision |
|---|---|---|
| 1 | Explicit Skill create request, but Registry search finds an exact-fit existing Skill | disposition=`reuse`; create no new Skill. |
| 2 | Existing Skill covers the same coherent responsibility but lacks a backward-compatible general option | disposition=`extend`; inspect contract and dependents before approving extension. |
| 3 | Existing Skill is 80% similar but missing part is an independent reusable responsibility | keep existing Skill unchanged; disposition for missing responsibility=`create` as a separate Skill. |
| 4 | Extending existing Skill would change trigger/input/output semantics for current dependents | do not approve silent extension; escalate to explicit refactor or separate Skill. |
| 5 | Reusable multi-capability Web advertising process; some capabilities already exist | design Flow + reuse existing Skills + create only missing independently reusable Skills. |
| 6 | Reusable multi-capability process; all required Skills already exist | no new Skills; create only Flow if orchestration itself is the requested missing reusable object. |
| 7 | Single coherent reusable responsibility with several internal steps | one Skill; no Flow merely because there are multiple steps. |
| 8 | Temporary multi-Skill execution request with no persistence intent | dynamic compose only; architect/build pipeline should not be invoked. |
| 9 | Capability is generic reasoning/writing that needs no stable reusable contract | disposition=`model`; do not create Skill. |
| 10 | Capability requires current external state/action/API | disposition=`external_tool`; do not bury external responsibility inside a Skill. |

## Quality gates

- Every create architecture starts from Registry evidence rather than a blank slate.
- Every required capability has a justified `reuse`/`extend`/`create`/`model`/`external_tool` disposition.
- New Skills are genuine gaps, not duplicates.
- Extend decisions preserve responsibility and backward compatibility.
- Dependents are considered when available before extension/refactor.
- Multi-capability reusable processes prefer Flow + minimum Skills.
- public/private visibility constraints remain unchanged.
