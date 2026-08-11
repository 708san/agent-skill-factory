# Architecture

## Principle

GitHub is the source of truth. ChatGPT Web is a client that loads current Factory modules and Skills through a narrow Action API.

## Repositories

- `agent-skill-factory` — public framework, API, Custom GPT bootstrap files
- `agent-skills-public` — public completed Skills
- `agent-skills-private` — confidential completed Skills

## Factory responsibilities

- Orchestrator: mode routing only
- Architect: capability placement, decomposition, boundaries, handoffs
- Author: implement one approved Skill Contract
- Reviewer: independent routing/behavior/outcome/regression evaluation
- Publisher: private → public-safe conversion

## Tool responsibilities

Repository read/write, branch creation, diff, PR, and rollback plumbing belong to the Action API rather than SKILL.md judgment logic.
