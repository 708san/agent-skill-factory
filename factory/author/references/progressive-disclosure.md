# Progressive Disclosure for Skill Packages

Use this guide when deciding what should be loaded every run versus only when needed.

## Keep in SKILL.md

Keep material that is required for correct execution on ordinary requests:

- trigger / non-trigger
- responsibility
- core workflow
- critical decision rules
- inputs / outputs
- quality gate
- resource loading rules
- failure handling
- Definition of Done

## Move to references when conditional

Good candidates include:

- long rubrics
- pattern catalogs
- medium- or industry-specific rules
- detailed checklists
- rare-case knowledge
- long good/bad examples
- extended explanation of a concise core rule

Each reference needs an explicit “when to load” condition in SKILL.md. Prefer a few coherent references over many tiny overlapping files.

## Use scripts instead of prose when appropriate

Deterministic repeated computation, validation, format checks, and static analysis are usually better scripts than long procedural instructions.

## Assets

Templates, images, reusable source material, and reference visuals belong in assets when they are meant to be consumed rather than reasoned over as instructions.

## Evals

Store behavior cases in evals rather than bloating SKILL.md. Include positive and negative behavior plus regressions that correspond to real failures.

## Size heuristic

When SKILL.md exceeds roughly 150–200 lines, explicitly evaluate whether conditional detail can move out. Line count is a review trigger, not an automatic split rule.

## Failure modes

Bad disclosure patterns include:

- putting every example and rubric into SKILL.md;
- creating many tiny references with overlapping content;
- moving critical decision rules into references so every request requires loading them;
- references that SKILL.md never names or never gives a loading condition for;
- duplicating the same rule in core and references.
