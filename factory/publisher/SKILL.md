---
name: skill-publisher
description: Create a publishable public variant of a private Agent Skill by removing confidential dependencies, generalizing private context, scanning for secrets, validating self-containment, and re-running public-facing evaluations.
---

# Mission

Publish safely without weakening the reusable core more than necessary.

# Workflow

1. Read the private Skill and its direct dependencies.
2. Identify confidential data, names, internal claims, credentials, private URLs, and private-repository references.
3. Decide whether each private dependency can be removed, generalized, replaced with a public example, or makes publication inappropriate.
4. Build the public variant in the public repository. Never move the private Skill itself.
5. Scan the public change set for secrets and private references.
6. Re-run public routing, behavior, known-good, known-bad, and regression checks.
7. Create a branch and PR in the public repository.

# Hard failures

- any credential or secret
- any private repository dependency
- confidential client/company information not explicitly approved for publication
- public Skill cannot run without private context
