# Agent Skill Factory

A web-first framework to design, author, review, refactor, and publish Agent Skills.

## Architecture

- ChatGPT Web Custom GPT = UI / orchestrator bootstrap
- GPT Actions = narrow API bridge
- GitHub = source of truth
- `agent-skills-public` = publishable skills
- `agent-skills-private` = confidential skills

The Custom GPT instructions intentionally stay small. It fetches the current Factory modules from this repository when needed.

## Factory modules

- `factory/orchestrator/SKILL.md`: mode routing and workflow control
- `factory/architect/SKILL.md`: decomposition, capability placement, skill boundaries, handoffs
- `factory/author/SKILL.md`: implements one approved Skill Contract
- `factory/reviewer/SKILL.md`: independent routing/behavior/outcome/regression review
- `factory/publisher/SKILL.md`: converts private skills to publishable public variants

## Web API

Vercel Functions under `api/` expose only the operations the Factory needs. GitHub credentials remain server-side.

## Setup

Read `docs/WEB_SETUP.md`.
