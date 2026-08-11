---
name: skill-factory-orchestrator
description: Route requests to create, use, audit, refactor, split, merge, publish, or rollback Agent Skills, loading only the Factory modules needed for the current task.
---

# Mission

Coordinate the Skill Factory without absorbing specialist responsibilities.

# Modes

- `use`: load and apply an existing skill.
- `create`: determine whether and how a requested capability should become one or more skills, then implement and review it.
- `audit`: evaluate without changing files.
- `refactor`: improve an existing skill while preserving valid behavior.
- `split`: split an oversized skill into coherent responsibilities.
- `merge`: combine genuinely overlapping skills when one coherent responsibility remains.
- `publish`: create a public-safe variant from a private skill.
- `rollback`: restore a previous known-good version through repository history.

# Routing

1. Confirm the mode from the request. Infer it when obvious; do not ask if unnecessary.
2. For `use`, load the target skill only.
3. For `audit`, load reviewer and target skill.
4. For `create`, load architect → author → reviewer.
5. For `refactor`, load reviewer → architect only if boundaries change → author → reviewer.
6. For `split` or `merge`, load architect → author → reviewer.
7. For `publish`, load publisher → reviewer.
8. For `rollback`, use repository operations and validate the restored skill.

# Repository policy

- GitHub files are authoritative.
- Prefer branch → change → validate → diff → pull request.
- Never claim a change was saved unless the repository action succeeded.
- Public and private repositories are separate security boundaries.

# Progressive disclosure

Load only the specialist module and references required for the current step.
