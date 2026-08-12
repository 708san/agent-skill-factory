# Multi-Skill Composition Runtime

Load this reference only after the orchestrator has decided that multiple Skills are necessary or the user explicitly requested multiple Skills.

## Minimal composition rule

Select the smallest Skill set that can complete the user goal at the requested quality level. Do not add Skills because they are merely relevant or available.

Do not compose when:

- one Skill's core workflow naturally completes the task;
- the task simply has multiple steps;
- normal model judgment is sufficient between Skill steps;
- splitting creates handoff cost without a meaningful quality or reuse gain.

## Skill Execution Plan

Maintain an internal plan with these fields:

- `user_goal`
- `selected_skills`
- `execution_order`
- `responsibilities`
- `inputs`
- `expected_outputs`
- `handoffs`
- `dependencies`
- `completion_condition`

The plan need not be shown verbatim to the user.

## Selection

1. Search the Registry instead of assuming a fixed chain.
2. Evaluate each candidate's responsibility, trigger/non-trigger, inputs, outputs, quality gate, and constraints.
3. Remove candidates that are redundant or not necessary for completion.
4. Respect explicit exclusions and stopping points from the user.

## Sequential handoff

For each dependent pair, record:

- upstream Skill
- downstream Skill
- transferred information or artifact
- assumptions
- unresolved items

Pass only the information needed by the downstream contract. Do not dump the upstream Skill's full instructions, references, or irrelevant intermediate material into the next Skill.

Example handoff:

`creative-theme-planning` output:

- target
- problem
- key value
- CTA
- visual direction

`visual-composition` input:

- target
- key value
- CTA
- visual direction

## Parallelizable work

Mark dependencies explicitly. If two Skills have no dependency, they are logically parallelizable. If the available runtime executes sequentially, preserve the logical independence without pretending true parallel execution occurred.

## Replanning

Update the plan when:

- a selected Skill is unsuitable;
- a required Skill is missing;
- upstream output differs materially from expectation;
- a planned downstream Skill becomes unnecessary;
- an additional responsibility becomes necessary.

After replanning, re-apply the minimal composition rule. Do not let the chain grow without bound.

## Failure handling

When a Skill cannot provide required output:

1. determine whether corrected input to the same Skill can solve it;
2. supplement or repair the upstream handoff when possible;
3. search for a replacement Skill only if needed;
4. ask the user for missing information when the requirement cannot otherwise be satisfied.

Never execute a downstream Skill when its required input is missing or invalid.

## Public/private composition

Public and private Skills may be combined in read-only use mode. Keep visibility explicit per Skill. Never write private Skill content, references, or derived private repository material into the public repository unless the publisher workflow explicitly sanitizes it.

## Completion

Composition is complete when the user's requested final output is produced, each required handoff was satisfied, unnecessary planned Skills were skipped, and no user stop/exclusion constraint was violated.
