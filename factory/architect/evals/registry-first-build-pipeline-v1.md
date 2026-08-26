# Registry-first Build Pipeline v1 — Architect evals

These cases validate Capability Gap planning, visibility scope, extension/dependent safety, Flow v1 representability, and Flow-first architecture.

| # | Scenario | Expected architecture decision |
|---|---|---|
| 1 | Explicit Skill create request, but legal Registry search finds an exact-fit existing Skill | disposition=`reuse`; create no new Skill. |
| 2 | Existing Skill covers the same coherent responsibility but lacks a backward-compatible general option | disposition=`extend`; inspect contract and required dependent scopes before approving extension. |
| 3 | Existing Skill is 80% similar but missing part is an independent reusable responsibility | keep existing Skill unchanged; disposition for missing responsibility=`create` as a separate Skill. |
| 4 | Extending existing Skill would change trigger/input/output semantics for current dependents | do not approve silent extension; escalate to explicit refactor or separate Skill. |
| 5 | Reusable multi-capability Web advertising process; some legal capabilities already exist | design Flow + reuse existing Skills + create only missing independently reusable Skills, subject to Flow representability. |
| 6 | Reusable multi-capability process; all required Skills already exist | no new Skills; create only Flow if orchestration itself is the requested missing reusable object. |
| 7 | Single coherent reusable responsibility with several internal steps | one Skill; no Flow merely because there are multiple steps. |
| 8 | Temporary multi-Skill execution request with no persistence intent | dynamic compose only; architect/build pipeline should not be invoked. |
| 9 | Capability is generic reasoning/writing that needs no stable reusable contract | disposition=`model`; do not create Skill. |
| 10 | Capability requires current external state/action/API | disposition=`external_tool`; do not bury external responsibility inside a Skill. |
| 11 | Persisted extension of a public Skill while `getRegistryDependents` is available | inspect both public dependents and private dependents in explicit scopes/refs before approval; use findings to judge compatibility, not as an automatic veto. |
| 12 | Persisted extension of a private Skill while `getRegistryDependents` is available | inspect private dependents before approval and use findings in compatibility judgment. |
| 13 | Private Flow creation; suitable Skill exists publicly | require search evidence from both public + private scopes; public Skill is legal direct `reuse` for the private Flow. |
| 14 | Public Flow creation; suitable Skill exists only privately | private Skill is not legal direct `reuse`; choose a public-safe alternative or publisher workflow. Never author public→private dependency. |
| 15 | Reusable Flow has a required model-native step and no independently justified Skill owns that responsibility | disposition remains `model`; current Flow v1 cannot represent it directly; return `unsupported_flow_capability`; do not omit the step or create a fake/unnecessary Skill just to fit schema. |
| 16 | Reusable Flow has a required external-tool/API step and no legal Skill representation | disposition remains `external_tool`; current Flow v1 cannot represent it directly; return `unsupported_flow_capability`; do not hide the tool responsibility inside a Skill or invent a step type. |

## Quality gates

- Every create architecture starts from visibility-correct Registry evidence rather than a blank slate.
- Target visibility is explicit before authoring and each capability records searched Registry scopes.
- Private targets search public + private; public direct-reuse dependencies remain public-only.
- Every required capability has a justified `reuse`/`extend`/`create`/`model`/`external_tool` disposition.
- New Skills are genuine gaps, not duplicates or schema-fitting shims.
- Extend decisions preserve responsibility and backward compatibility.
- When available, dependent inspection is mandatory for persisted existing-Skill changes: public target → public + private dependents; private target → private dependents.
- Dependents inform contract/backward-compatibility judgment rather than acting as an automatic veto.
- Multi-capability reusable processes prefer Flow + minimum Skills.
- Any required Flow capability not representable as current `exact_skill`/Skill-resolved `capability` blocks authoring as `unsupported_flow_capability` or equivalent.
- public/private visibility constraints remain unchanged.
