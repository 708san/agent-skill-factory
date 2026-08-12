# Runtime and Composition Regression Cases — 2026-08-12

## Test A — exact
Input: `$human-writing-review\nこの文章をレビューして`
Expected: `getSkill` → execute. No unnecessary `searchSkills`.

## Test B — explicit discover
Input: `この文章をAIっぽくなくしたい。適切なSkillを探して使って。`
Expected: `searchSkills` → `human-writing-review` → `getSkill` → execute.

## Test C — implicit discover
Context: Agent Skill Factory is invoked.
Input: `この文章をAIっぽくなくしたい。`
Expected: concrete edit request triggers `searchSkills` → matching Skill → `getSkill` → execute even though the word Skill is absent.

## Test D — recommend
Input: `文章をAIっぽくなくするのに使えるSkillある？今回はまだ使わない。`
Expected: `searchSkills` only; no `getSkill`, no execution.

## Test E — ordinary question
Input: `AIっぽい文章とはどういう文章？`
Expected: no Skill discovery.

## Test F — Factory meta
Input: `searchSkillsはどういう仕組み？`
Expected: no use runtime / Skill discovery.

## Test I — use read-only
Scenario: execute an existing Skill.
Expected: no branch, write, delete, publish, or PR action.

## Test K — sequential composition
Input: `テーマと構図を考えて広告画像を作って。`
Registry: `creative-theme-planning`, `visual-composition`, `image-generation`.
Expected: assess necessity → search → select minimum sufficient set → theme → compact handoff → composition → compact handoff → generation.

## Test L — unnecessary composition
Input: `この文章をAIっぽくなくして。`
Registry: `human-writing-review`.
Expected: one Skill completes the task; no artificial multi-Skill chain.

## Test M — partial task
Input: `広告画像の構図だけ考えて。画像はまだ作らない。`
Expected: stop at composition responsibility; do not execute image generation.

## Test N — replanning
Scenario: after Skill A, planned Skill B is no longer necessary.
Expected: remove Skill B and finish with the smaller plan.

## Test O — failed handoff
Scenario: upstream output lacks downstream required input.
Expected: do not run downstream unchanged; repair upstream handoff or request missing information.

## Test P — private/public composition
Scenario: private Skill + public Skill in use mode.
Expected: both may execute read-only; no private-to-public write.

## Test Q — exact multi-Skill request
Input: `$skill-a → $skill-b の順に使って。`
Expected: verify existence/visibility and compatibility → execute in specified order → pass only required handoff.

## Test R — minimal plan
Scenario: four candidate Skills exist; only two are needed.
Expected: execute two, not four.

## Test S — ordinary multi-step workflow
Input: `この文章をレビューして、問題があれば修正して。`
Registry: `human-writing-review`.
Expected: one Skill handles review → rewrite as its core workflow; do not split mechanically.

## Regression expectations

- Existing create/use/audit/refactor/split/merge/publish/rollback routing remains intact.
- Exact named Skill use remains direct.
- Concrete execution requests can trigger implicit discovery.
- Explanation-only ordinary/meta questions do not trigger discovery.
- Composition is minimal, contract-driven, read-only, and progressively disclosed.
