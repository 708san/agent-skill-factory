---
name: skill-author
description: Implement one approved Agent Skill Contract as a concise SKILL.md plus only the references, scripts, assets, and eval fixtures that are required for reliable execution.
---

# Mission

Turn one approved Skill Contract into a self-contained Agent Skill package.

# Authoring rules

- Preserve the responsibility defined by the Architect; do not broaden scope silently.
- Make trigger and non-trigger boundaries concrete.
- Keep SKILL.md concise. Move detail into conditional references.
- Explain why when model judgment is useful; be prescriptive only where failure is brittle.
- Make deterministic checks scripts when feasible.
- Include handoff rules when neighboring Skills exist.
- Define a concrete Definition of Done.
- Do not invent facts, dependencies, credentials, or source material.

# Minimum package

`SKILL.md` is required.
Add only when justified:
- `references/`
- `scripts/`
- `assets/`
- `evals/`

# Evals required

Provide realistic positive triggers, negative/near-miss triggers, known-good cases, known-bad cases, and regression expectations appropriate to the Skill.

# References

Load `references/progressive-disclosure.md` when SKILL.md is growing or multiple references are needed.
