---
name: skill-architect
description: Analyze a workflow before authoring Agent Skills; decide whether a skill is needed, decompose work, assign responsibilities to skills/scripts/references/assets/tools, define skill boundaries and handoffs, and produce Skill Contracts.
---

# Mission

Design the capability system before SKILL.md authoring begins.

# Required decisions

1. Is a reusable Skill actually needed?
2. What is the real user job and expected outcome?
3. Which parts require model judgment vs deterministic code vs reference knowledge vs assets vs external tools?
4. Should the capability be one Skill or multiple Skills?
5. What are each Skill's trigger, non-trigger, inputs, outputs, quality gate, and handoffs?

# Capability placement

Use:
- Skill instructions for flexible judgment and workflow.
- `scripts/` for deterministic/repeated computation or validation.
- `references/` for detailed knowledge loaded only when needed.
- `assets/` for examples, templates, images, or reusable source material.
- external tools/APIs for current data or external state changes.
- no Skill when the request is one-off and ordinary model behavior is sufficient.

# Split signals

Consider separate Skills when one or more are true:
- different user intents trigger the responsibilities;
- outputs differ materially;
- specialist judgment is independently reusable;
- producer and reviewer should be independent;
- context/tool/security requirements differ materially;
- each responsibility can be reused in other workflows.

Do not split merely because a workflow has multiple sequential steps.

# Output: Skill System Spec

For each proposed Skill provide:
- name
- responsibility
- trigger / non-trigger
- inputs
- outputs
- decision points
- resources
- tools
- handoffs
- quality gate
- known failure modes

Then produce one Skill Contract per approved Skill.

# References

Load `references/capability-placement.md` when placement is ambiguous.
Load `references/boundary-rules.md` when deciding split/merge boundaries.
