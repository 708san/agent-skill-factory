# Registry-first Build Pipeline v1 — Reviewer evals

These cases make Registry-first and Reuse Boundary Check gates independently testable.

| # | Review scenario | Expected reviewer result |
|---|---|---|
| 1 | ordinary task persisted Registry object | FAIL. |
| 2 | read-only audit bypasses Creation Gate and does not mutate | PASS for authorization. |
| 3 | persistence without explicit creation/change intent | FAIL. |
| 4 | explicit create reaches Architect/Author before Registry Search | FAIL. |
| 5 | strong candidate exists but only search name/description was read before new Skill create | FAIL: Candidate Skill Inspection missing. |
| 6 | strong candidate SKILL.md inspected and its workflow already owns requested sub-capability, but new Skill duplicates that sub-step | FAIL: Reuse Boundary Check violated. |
| 7 | existing Skill explicitly says keep X/Y in one workflow; ordinary create extracts Y to new Skill | FAIL: explicit non-split boundary violated. |
| 8 | 80–90% natural fit creates new Skill without considering extend | FAIL. |
| 9 | create has no splitJustification | FAIL. |
| 10 | splitJustification does not prove independent user goal + independent output + independent reuse + non-sub-step boundary | FAIL. |
| 11 | `human-writing-review` inspected and shown to own review/diagnosis/revision/business-writing/formality/voice as unified workflow; design reuses it alone for keigo/style check + natural rewrite | PASS; no extracted Skill/Flow required. |
| 12 | same `human-writing-review` scenario creates a separate keigo/style diagnostic Skill | FAIL: internal workflow/sub-responsibility duplication. |
| 13 | same scenario creates a Flow merely to chain diagnostic + rewrite stages already owned by one Skill | FAIL: unnecessary Flow externalizes one coherent Skill workflow. |
| 14 | genuinely independent capability has independent goal/output/reuse and candidates do not own it | PASS for create when splitJustification records evidence. |
| 15 | public existing-Skill extend lacks public+private dependent checks when available | FAIL. |
| 16 | private existing-Skill extend lacks private dependent checks when available | FAIL. |
| 17 | public target directly depends on private candidate | FAIL. |
| 18 | private target searched only private and missed public candidate | FAIL. |
| 19 | required model/external-tool Flow step is silently omitted or schema-fit into fake Skill | FAIL. |
| 20 | ordinary failed discovery falls back read-only without mutation | PASS. |

## Reviewer invariants

- Registry-first means search + strong-candidate SKILL.md inspection + boundary reasoning, not description-level search only.
- internal sub-responsibilities are not duplicated.
- explicit non-split rules are authoritative absent explicit refactor/split intent.
- partial fit considers extend.
- every create carries evidence-backed splitJustification.
- exact/discover/recommend/compose/saved Flow/public-private/v0.9.0 regressions remain protected.
