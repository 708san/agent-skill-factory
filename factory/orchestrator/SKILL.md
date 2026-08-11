---
name: skill-factory-orchestrator
description: Route requests to create, use, audit, refactor, split, merge, publish, or rollback Agent Skills; support exact skill execution, discovery, and recommendation while loading only the resources needed for the current task.
---

# Mission

Coordinate the Skill Factory without absorbing specialist responsibilities. GitHub-backed Factory modules and Agent Skills are the source of truth.

# Modes

- `use`: find, load, and apply an existing skill without modifying repositories.
- `create`: determine whether and how a requested capability should become one or more skills, then implement and review it.
- `audit`: evaluate without changing files.
- `refactor`: improve an existing skill while preserving valid behavior.
- `split`: split an oversized skill into coherent responsibilities.
- `merge`: combine genuinely overlapping skills when one coherent responsibility remains.
- `publish`: create a public-safe variant from a private skill.
- `rollback`: restore a previous known-good version through repository history.

# Routing

1. Confirm the mode from the request. Infer it when obvious; do not ask if unnecessary.
2. For `use`, follow the runtime rules below and do not write to a repository.
3. For `audit`, load reviewer and target skill.
4. For `create`, load architect → author → reviewer.
5. For `refactor`, load reviewer → architect only if boundaries change → author → reviewer.
6. For `split` or `merge`, load architect → author → reviewer.
7. For `publish`, load publisher → reviewer.
8. For `rollback`, use repository operations and validate the restored skill.

# Use runtime

Classify `use` requests as exactly one of the following paths.

## A. exact

Use when the user explicitly names a Skill, including `$skill-name` or wording such as “skill-nameを使って”.

1. Resolve the requested public/private visibility. If the same name exists in both, keep visibility explicit and do not silently substitute one for the other.
2. Call `getSkill` for that exact Skill and treat the returned current `SKILL.md` as authoritative.
3. Call `getSkillFile` only for references or additional files that the loaded `SKILL.md` actually requires for this task.
4. Execute the Skill.

Do not search broadly before an exact lookup unless resolving visibility requires it.

## B. discover

Use when the user wants a suitable Skill applied but does not know or provide its name, such as “適切なSkillを使って”, “使えるSkillを選んで”, or equivalent wording.

1. Call `searchSkills` with a task-focused query and explicit visibility scope.
2. Evaluate returned candidates by name, description, visibility, and optional metadata when present.
3. If one Skill is clearly best, select it without unnecessary confirmation.
4. Ask the user only when multiple candidates would materially change the outcome and intent cannot be inferred safely.
5. Call `getSkill` for the selected Skill.
6. Load only additional files that its `SKILL.md` requires.
7. Execute the Skill.

## C. recommend

Use when the user asks only for Skill candidates or availability, such as “使えるSkillある？” or “競合調査に使えるSkillは？”, without asking to run one.

1. Call `searchSkills`.
2. Present the best candidates with their intended use and visibility.
3. Do not call `getSkill` or execute a Skill unless the user asks to use one.

# When not to use Skills

For ordinary questions where the user neither names a Skill nor asks to find, choose, recommend, or use one, answer normally. Do not invoke Skill discovery merely because a possibly relevant Skill could exist.

# Search contract

`searchSkills` should accept at minimum:

- `query`
- `visibility`
- `limit`

Each result should return at minimum:

- `name`
- `description`
- `visibility`

Search must cover Skill name and `SKILL.md` frontmatter `description`. Metadata may additionally expose `tags`, `use_when`, and `do_not_use_when` for forward-compatible ranking, but existing Skills must not be required to define them.

# Repository policy

- GitHub files returned by repository Actions are authoritative; do not embed fixed copies of Skill bodies into GPT instructions.
- `use` mode is read-only. If Skill usage reveals an improvement opportunity, mention it as a suggestion unless the user explicitly requests a change.
- For `create`, `refactor`, `split`, `merge`, `publish`, and other change workflows, use a non-main branch and perform branch → write → validate → diff as part of the requested change.
- Never write directly to `main`.
- Create a pull request only when the user explicitly asks for PR creation or explicitly says to proceed through PR if the result is acceptable. Otherwise stop after diff/validation and wait for confirmation.
- Never claim a change was saved unless the corresponding repository Action succeeded.
- Public and private repositories are separate security boundaries. Never copy private Skill contents to public storage except through the publisher workflow after sanitization.

# Progressive disclosure

Load resources in this order and only as needed:

orchestrator → required Factory module(s) → target `SKILL.md` → files explicitly required by that `SKILL.md`.

Do not preload all Factory modules, all Skills, or all references.

# Definition of done

A routed request is complete only when:

- the correct mode and `use` sub-path were selected;
- repository writes occurred only in change modes and only on a non-main branch;
- exact/discover/recommend behavior followed the runtime rules above;
- public/private visibility remained explicit and isolated;
- only necessary Factory modules, Skills, and references were loaded;
- PR creation obeyed explicit user intent.
