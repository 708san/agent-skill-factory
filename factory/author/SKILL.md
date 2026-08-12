---
name: skill-author
description: Implement Agent Skill packages on non-main branches with correct registry paths, progressive disclosure, explicit contracts, appropriate references/scripts/assets/evals, validation, and minimal duplication.
---

# Mission

Author complete Skill packages from an approved architecture. A Skill package is not synonymous with one SKILL.md file.

# Before writing

For a new Skill, confirm:

- target package path;
- package structure;
- what must remain in SKILL.md;
- what belongs in references;
- whether scripts are justified;
- whether assets are justified;
- what evals are required.

For an existing Skill, inspect before changing:

1. current `SKILL.md`;
2. directory structure;
3. references;
4. scripts;
5. assets;
6. evals.

Do not recreate information that already exists in another package file.

# Registry path invariant

Skill packages must live under:

`skills/<skill-name>/`

Required:

`skills/<skill-name>/SKILL.md`

Optional:

- `skills/<skill-name>/references/`
- `skills/<skill-name>/scripts/`
- `skills/<skill-name>/assets/`
- `skills/<skill-name>/evals/`

Never write `<skill-name>/SKILL.md` at repository root. Reject absolute paths, traversal, and accidental writes into another Skill directory.

After writing, inspect the diff and confirm all intended Skill-package changes are under the expected `skills/<skill-name>/` root.

# SKILL.md core

Keep always-needed execution material in SKILL.md:

- trigger and non-trigger;
- responsibility;
- core workflow;
- critical decision rules;
- input contract;
- output contract;
- quality gate;
- resource loading rules;
- failure handling;
- Definition of Done.

For composable Skills, make inputs/outputs and handoff expectations sufficiently explicit for loose coupling. Do not require one named upstream Skill when an input contract is enough.

# Progressive Disclosure

Load `references/progressive-disclosure.md` when the package contains substantial conditional detail or SKILL.md approaches roughly 150–200 lines.

Consider moving out:

- long rubrics and pattern lists;
- medium- or industry-specific guidance;
- detailed checklists;
- case-specific knowledge;
- long good/bad examples;
- long explanations of core rules.

Do not split mechanically by line count. Do not move essential judgment out if the core Skill can no longer execute straightforward requests without loading references.

Every reference must have a clear loading condition in SKILL.md. Avoid tiny overlapping references and unused files.

# Resource boundaries

Use:

- `references/` for conditional knowledge;
- `scripts/` for deterministic or repeated processing, validation, format checks, or static analysis;
- `assets/` for templates, images, reusable source files, or reference visuals;
- `evals/` for positive, implicit, explicit, negative, near-miss, known-good, known-bad, and regression behavior as relevant.

# Change workflow

Use a non-main branch. Perform write → validate → diff, then hand the completed package to reviewer. Do not create a PR unless the user explicitly requested or authorized it.

# Definition of done

Authoring is complete when:

- package path is canonical;
- SKILL.md contains the core and only the core;
- conditional resources are structured without duplication;
- eval coverage includes realistic triggers and regressions;
- validation and secret scan pass;
- diff stays within intended package boundaries;
- reviewer receives the complete package, not only SKILL.md.
