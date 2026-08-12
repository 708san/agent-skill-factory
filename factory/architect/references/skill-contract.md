# Skill Contract and Handoff Design

Load when a Skill may compose with others or its reusable boundary is unclear.

## Contract fields

Document in the Skill body or concise package documentation as appropriate:

- responsibility
- trigger
- non-trigger
- inputs
- outputs
- quality gate
- handoff_in
- handoff_out
- failure modes

Do not force all fields into frontmatter.

## Loose coupling

Describe inputs semantically instead of naming a required upstream Skill. Describe outputs so another Skill or the user can consume them without depending on internal reasoning.

## Handoff quality

A handoff should state:

- transferred information or artifact
- assumptions
- unresolved items
- fields required by the downstream responsibility

Avoid transferring full upstream instructions or irrelevant context.

## Split test

Consider a separate Skill only when responsibility, output, and reuse are independently meaningful. If the second step exists only to finish the first Skill's normal workflow, keep one Skill.
