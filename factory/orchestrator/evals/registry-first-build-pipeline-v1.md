# Registry-first Build Pipeline v1 — Orchestrator evals

These cases validate request classification, mutation authorization, visibility-aware Registry Search, Candidate Skill Inspection, Reuse Boundary Check, and explicit Registry creation/change.

| # | Prompt / setup | Expected routing |
|---|---|---|
| 1 | `広告を作って` | `use`; no Creation Gate; no Registry mutation. |
| 2 | `この文章を自然に直して` | `use`; existing discovery allowed; failed discovery falls back to model/tool/compose, never create. |
| 3 | `この作業用のSkillを作って` | explicit create; Registry Search then strong-candidate inspection then Reuse Boundary Check before gap plan/Architect/Author. |
| 4 | reusable multi-capability process | search Skills/Flows in legal scopes; inspect strong Skill candidates; create only genuine independent gaps; Flow only when responsibilities are independently reusable. |
| 5 | all required capabilities already exist | no new Skill; if one existing Skill owns the full coherent workflow, no Flow either. |
| 6 | existing Skill is 80–90% fit | inspect SKILL.md; consider extend before create; persisted extend checks contract/dependents/compatibility. |
| 7 | proposed extension breaks contract | do not silent-extend; separate responsibility or explicit refactor. |
| 8 | `この処理をもっと良くして` without Registry persistence intent | read-only task improvement; no mutation. |
| 9 | `このSkillを改善して` | explicit change/refactor; inspect contract and dependents before persistence. |
| 10 | `この処理をFlow化して` | explicit Flow create; search + candidate inspection + boundary check first; author only independently reusable/representable steps. |
| 11 | `このSkillを監査して。変更はしないで` | audit; Creation Gate unnecessary; no mutation. |
| 12 | private target with suitable public Skill | search public + private; public Skill may be reused legally. |
| 13 | public target with private-only candidate | never direct public→private reuse; public-safe create/extend or publisher decision. |
| 14 | visibility unresolved | do not finalize gap from one Registry; settle visibility before authoring. |
| 15 | `敬語・文体の不整合チェックと自然なリライトができる仕組みを作って`; `human-writing-review` is a strong candidate whose SKILL.md owns review, diagnosis, revision, business writing, formality/voice and says review+revision stay one workflow | call `getSkill`; inspect boundary; disposition=`reuse`; do not create a keigo/style-check sub-Skill; if existing Skill alone satisfies the requested coherent workflow, do not create Flow. |
| 16 | search description suggests partial match but SKILL.md workflow explicitly contains requested diagnostic stage | inspected boundary overrides description-level gap assumption; reuse, not create. |
| 17 | strong candidate has explicit `do not split` / unified workflow rule | ordinary create honors boundary; violating it requires explicit refactor/split intent. |

## Regression assertions

- exact invocation, implicit discovery, recommend, dynamic compose, saved Flow execution, Suite scope remain available.
- use/audit/meta remain read-only.
- Creation Gate applies only to mutation modes.
- public/private boundary remains unchanged.
- Capability Gap Plan records target visibility and searched scopes plus candidate/boundary evidence.
- description-level search alone never justifies create when a strong candidate exists.
- PR remains explicit opt-in.
- v0.9.0 hardening is unaffected.
- no automatic Skillizer exists.
