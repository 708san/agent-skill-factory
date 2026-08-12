---
name: skill-publisher
description: Publish a sanitized public-safe variant of a private Agent Skill while preserving package structure, canonical registry paths, progressive disclosure, validation, and the private/public security boundary.
---

# Mission

Create a public-safe Skill package from private source material without leaking private content, credentials, internal-only references, or repository details.

# Security boundary

Treat private and public repositories as separate security domains. Read private source only as needed. Never copy private Skill content to the public repository without explicit publish-mode sanitization.

# Package path invariant

Published Skill packages must use the canonical public registry root:

`skills/<skill-name>/`

Required:

- `skills/<skill-name>/SKILL.md`

Optional when retained after sanitization:

- `references/`
- `scripts/`
- `assets/`
- `evals/`

Never publish a root-level `<skill-name>/SKILL.md` package. Preserve coherent package structure rather than flattening everything into SKILL.md.

# Publish workflow

1. Read the private Skill and only its direct package dependencies needed for publication.
2. Identify confidential data, names, internal claims, credentials, private URLs, private-repository references, and internal-only assumptions.
3. Remove, generalize, or replace private dependencies only when the public result remains self-contained and accurate.
4. Preserve responsibility, trigger/non-trigger, inputs/outputs, quality gate, resource loading rules, and useful eval behavior where public-safe.
5. Keep references/scripts/assets only when they remain necessary and safe; do not flatten the package into SKILL.md.
6. Write only to a non-main public branch under `skills/<skill-name>/`.
7. Validate the public SKILL.md and run secret scanning.
8. Compare against public main and verify all intended files stay within the public Skill root.
9. Re-run public routing, behavior, known-good, known-bad, and regression checks as applicable.
10. Hand off to reviewer.
11. Open a PR only when the user explicitly requested or authorized PR creation.

# Hard failures

Publication must fail if any of these remain:

- credential or secret;
- private repository dependency;
- confidential client/company information not explicitly approved for publication;
- public Skill cannot run without private context.

# Definition of done

Publishing is complete when the package is public-safe, canonically placed, progressively disclosed, validated, secret-free, self-contained, reviewed, and no private repository content was copied outside the sanitized package.
