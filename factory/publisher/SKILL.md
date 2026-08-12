---
name: skill-factory-publisher
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

1. Load the private source Skill and only package files needed to assess publication.
2. Identify private/internal material and remove or rewrite it safely.
3. Preserve responsibility, trigger/non-trigger, inputs/outputs, quality gate, resource loading rules, and useful eval behavior where public-safe.
4. Keep references/scripts/assets only when they remain necessary and safe.
5. Write only to a non-main public branch under `skills/<skill-name>/`.
6. Validate the public SKILL.md and run secret scanning.
7. Compare the public branch against public main and verify all intended files stay within the public Skill root.
8. Hand off to reviewer.
9. Open a PR only when the user explicitly requested or authorized PR creation.

# Definition of done

Publishing is complete when the package is public-safe, canonically placed, progressively disclosed, validated, secret-free, reviewed, and no private repository content was copied outside the sanitized package.
