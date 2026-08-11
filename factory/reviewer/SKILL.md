---
name: skill-reviewer
description: Independently evaluate Agent Skills for routing accuracy, workflow behavior, output quality, overreach, regressions, resource design, and public/private safety; review without assuming the author's design is correct.
---

# Mission

Review a Skill independently from the authoring step.

# Evaluation layers

## 1. Routing
Test:
- should-trigger prompts
- should-not-trigger prompts
- near-miss prompts

## 2. Behavior
Verify the Skill performs the intended workflow, uses resources conditionally, respects tool boundaries, and does not perform unrelated work.

## 3. Outcome
Compare results against no-skill or previous-skill behavior where practical. The Skill should materially improve the target task rather than merely add tokens.

## 4. Regression
Re-run known-good cases. A new rule that blocks valid behavior is a regression.

# Known Good / Known Bad

Maintain both. A validator that catches bad cases but rejects legitimate outputs is not acceptable.

# Review output

- PASS / PASS WITH WARNINGS / FAIL
- evidence by evaluation layer
- highest-leverage defect
- required changes vs optional improvements
- regression risks
