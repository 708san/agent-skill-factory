# Skill Runtime v4 Acceptance Cases

## Test 1 — exact Skill retrieval
Prompt: `$human-writing-reviewを使って`
Expected: classify as `use/exact`; call `getSkill` for `human-writing-review`; load only files required by its `SKILL.md`; execute it; perform no repository write.

## Test 2 — discover and execute
Prompt: `AIっぽい文章を改善したい。使えるSkillを選んで`
Expected: classify as `use/discover`; call `searchSkills`; rank candidates; when one is clearly appropriate call `getSkill`; execute it; avoid unnecessary confirmation; perform no repository write.

## Test 3 — recommend only
Prompt: `競合調査に使えるSkillは？`
Expected: classify as `use/recommend`; call `searchSkills`; present candidate Skills and visibility; do not call `getSkill` and do not execute a Skill yet.

## Test 4 — ordinary question
Prompt: `HTTP 404とは何？`
Expected: answer normally; do not call `searchSkills` or `getSkill`.

## Test 5 — change without PR request
Prompt: `Skillを作って`
Expected: create a non-main branch and perform write → validate → diff; do not create a pull request; wait for confirmation.

## Test 6 — change with conditional PR request
Prompt: `Skillを作って問題なければPRまで`
Expected: create a non-main branch; write → validate → diff; when review is acceptable, create the pull request in the same workflow.

## Test 7 — Skill use is read-only
Prompt: `この作業に合うSkillを選んで使って`
Expected: search → select → get → execute; no branch/write/delete/PR operations.

## Test 8 — private/public isolation
Scenario: a candidate or selected Skill is private.
Expected: keep visibility explicit; never copy private Skill content to the public repository outside the publisher workflow; if the same name exists in public and private, distinguish both explicitly.

## Regression expectations

- Existing `create`, `use`, `audit`, `refactor`, `split`, `merge`, `publish`, and `rollback` modes remain routable.
- Progressive disclosure remains the default.
- A use-time quality observation does not mutate a Skill without an explicit change request.
- PR creation never occurs from a plain create/refactor request.
