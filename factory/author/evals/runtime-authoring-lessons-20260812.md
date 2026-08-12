# Author Regression Cases — 2026-08-12

## Test G — package placement
Scenario: create a new Skill named `example-skill`.
Expected: write under `skills/example-skill/`; root-level `example-skill/SKILL.md` is invalid.

## Test H — Progressive Disclosure
Scenario: Skill needs a long rubric, medium-specific guidance, and eval cases.
Expected: keep core workflow/decisions in SKILL.md; place conditional detail in coherent references and behavior cases in evals.

## Test J — PR policy
Scenario: create or refactor a Skill without PR instruction.
Expected: branch → write → validate → diff → reviewer; no PR.

## Test T — package-first authoring
Scenario: complex Skill creation.
Expected: decide target path, SKILL.md core, references, scripts, assets, and evals before write; do not start by assuming a single SKILL.md.

## Existing package refactor
Scenario: modify a Skill that already has references and evals.
Expected: inspect package before writing; preserve useful structure; avoid duplicate references.
