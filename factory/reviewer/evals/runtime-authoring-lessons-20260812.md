# Reviewer Regression Cases — 2026-08-12

## Misplaced package
Diff contains `example-skill/SKILL.md`.
Expected: blocking failure; require `skills/example-skill/SKILL.md`.

## Overloaded SKILL.md
Scenario: ~275-line SKILL.md includes long rubric, media rules, detailed cases, and examples.
Expected: require disclosure review; externalize conditional detail when coherent while preserving core decisions.

## Over-split references
Scenario: many tiny overlapping references with no loading conditions.
Expected: blocking or material issue; consolidate and add explicit load conditions.

## Lost core rule
Scenario: all decision criteria moved to references.
Expected: fail because ordinary execution cannot proceed from core Skill.

## Implicit trigger missing
Scenario: Skill should match a natural concrete request but evals only test `$skill-name`.
Expected: request implicit-trigger regression coverage.

## Boundary regression
Scenario: one writing-review Skill also performs SEO research and fact-checking.
Expected: flag unrelated responsibilities unless architecture proves one coherent reusable intent/output.

## Natural workflow
Scenario: review → rewrite within one editorial responsibility.
Expected: do not require unnecessary split.
