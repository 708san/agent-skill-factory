# Architect Regression Cases — 2026-08-12

## Test T — package creation
Scenario: create a complex Skill with long rubric, medium-specific guidance, repeatable validation, reusable template, and behavior tests.
Expected: architect first decides placement across Skill / reference / script / asset / eval; does not default to one giant SKILL.md.

## Composition boundary
Scenario: `review → rewrite` for one piece of prose.
Expected: one coherent Skill when both steps share responsibility and output purpose.

## Independent responsibilities
Scenario: theme planning → visual composition → image generation.
Expected: separate Skill candidates when each has independent output and reuse value; define handoffs and dependencies.

## Tool boundary
Scenario: capability requires current external data or external side effect.
Expected: external tool/API boundary, not embedded static Skill knowledge.
