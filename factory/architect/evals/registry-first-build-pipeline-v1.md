# Registry-first Build Pipeline v1 — Architect evals

These cases validate Reuse Boundary Check, Capability Gap planning, visibility, extension/dependent safety, Flow representability, and Flow-first architecture.

| # | Scenario | Expected architecture decision |
|---|---|---|
| 1 | exact-fit existing Skill after inspection | `reuse`; create nothing. |
| 2 | same coherent responsibility but missing backward-compatible coverage | consider `extend`; inspect contract/dependents/compatibility. |
| 3 | independent missing capability with independent goal/output/reuse | `create` allowed only with splitJustification proving it is not an existing Skill sub-step. |
| 4 | extension changes current contract | explicit refactor or separate responsibility; no silent extend. |
| 5 | reusable genuinely multi-capability process | Flow + reuse existing Skills + minimum genuine independent new Skills. |
| 6 | all required independent Skills already exist | no new Skills; create only missing Flow orchestration when needed. |
| 7 | one coherent responsibility with several workflow stages | one Skill; stages alone do not justify Flow/sub-Skills. |
| 8 | temporary multi-Skill task | dynamic compose; no persistence. |
| 9 | generic model-native capability | disposition=`model`; do not create Skill. |
| 10 | external action/API responsibility | disposition=`external_tool`; do not bury into Skill. |
| 11 | persisted public Skill extend | inspect public + private dependents when available. |
| 12 | persisted private Skill extend | inspect private dependents when available. |
| 13 | private target and suitable public Skill | public Skill is legal `reuse`. |
| 14 | public target and private-only candidate | no direct reuse; public-safe/publisher path. |
| 15 | required model-native Flow step unrepresentable in v1 | `unsupported_flow_capability`; no omission or fake Skill. |
| 16 | required external-tool Flow step unrepresentable in v1 | fail closed; no hidden tool/unsupported step. |
| 17 | `human-writing-review` inspected: review + diagnosis + revision + business writing + formality/voice are one workflow; explicit non-split review/revision boundary | requested keigo/style diagnosis + natural rewrite is owned by this Skill; disposition=`reuse`; no extracted diagnostic Skill and no Flow if this Skill alone satisfies outcome. |
| 18 | 80–90% fit and requested addition naturally belongs inside candidate responsibility | evaluate `extend` before `create`; create is blocked without independent-responsibility splitJustification. |
| 19 | candidate explicitly defines X/Y as one workflow | Y-only Skill create is blocked in ordinary create; route to explicit refactor/split if boundary must change. |
| 20 | capability not owned by candidates and has independent user goal, independent output, independent reuse across other workflows | `create` allowed with evidence-backed splitJustification. |

## Quality gates

- strong candidates are inspected with current SKILL.md, not judged from descriptions only.
- boundary evidence includes responsibility, workflow, contracts, failure modes, handoffs, and non-split rules.
- each create has splitJustification proving independent responsibility.
- partial fit considers extend first.
- no internal workflow stage is duplicated as a new Skill.
- visibility/dependent/Flow-v1 rules remain unchanged.
