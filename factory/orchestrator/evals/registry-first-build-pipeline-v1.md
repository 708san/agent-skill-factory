# Registry-first Build Pipeline v1 — Orchestrator evals

These cases validate request classification, read-only routing, the mutation-only Creation Gate, and explicit Registry creation/change.

| # | Prompt / setup | Expected routing |
|---|---|---|
| 1 | `広告を作って` | `use`; Creation Gate not required. Existing Skill/Flow discovery/use and dynamic compose are allowed; no branch/write/new Skill/Flow/Suite mutation. |
| 2 | `この文章を自然に直して` | `use`; existing Skill discovery/use is allowed; no new Skill creation even if no matching Skill exists. |
| 3 | `この作業用のSkillを作って` | Explicit `create`; Creation Gate required and passes. Search Registry before Architect/Author; evaluate reuse/extend/create/model/external_tool before authoring. |
| 4 | `Web広告制作を一式できる再利用可能な仕組みを作って` | Explicit reusable multi-capability create. Search existing Flows and Skills, decompose capabilities, build gap plan, prefer Flow + minimum missing Skills. |
| 5 | Registry already contains all required Skills for the requested reusable process | Create no new Skill. Reuse existing Skills; create only a Flow if explicit reusable orchestration is missing/needed. |
| 6 | Existing Skill matches about 80% of requested reusable responsibility | Do not blindly create a duplicate. Evaluate `extend`; inspect responsibility/contract and required dependents when available. |
| 7 | Proposed extension would break existing Skill contract/meaning | Do not silently modify under create. Choose separate Skill when independent, or route to explicit refactor. |
| 8 | `この処理をもっと良くして` with no Skill/Flow/Suite/reuse/persistence context | Treat as task improvement/use. Creation Gate not required; no Registry change. |
| 9 | `このSkillを改善して` | Explicit mutation/refactor intent. Creation Gate required; inspect existing object, contract, required dependents, then change workflow. |
| 10 | `この処理をFlow化して` | Explicit Flow creation. Creation Gate required; search existing Flows/Skills first, plan reuse and missing capabilities, then Architect/Author/Reviewer. |
| 11 | `このSkillを監査して。変更はしないで` | `audit`; Creation Gate not required; load reviewer/target evidence only; repository mutation is forbidden. |
| 12 | Ordinary concrete task where Skill discovery returns no suitable candidate | remain read-only; fall back to model/tool capability or dynamic compose as appropriate; never transition to `create` and never mutate Registry state. |

## Regression assertions

- `$skill-name` remains exact invocation.
- Concrete tasks may still trigger implicit existing-Skill discovery.
- Recommendation remains read-only.
- Dynamic compose remains available and temporary.
- Existing saved Flow execution remains available.
- Suite discovery scope remains contextual/non-owning.
- read-only use/audit/ordinary-meta perform no repository mutation.
- Creation Gate applies only to mutation-oriented modes.
- public/private boundary remains unchanged.
- PR creation remains explicit opt-in.
- v0.9.0 hardening behavior is unaffected by these routing changes.
- No automatic Skillizer/persistence path exists for ordinary tasks.
