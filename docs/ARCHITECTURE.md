# Architecture

## Principle

GitHub is the source of truth. ChatGPT Web is a client that loads current Factory modules and Registry objects through Actions.

Agent Skill Factory separates read-only runtime behavior from Registry mutation. Ordinary tasks and read-only audits do not mutate the Registry. Persistence begins only after explicit creation/change authorization.

## Repositories

- `agent-skill-factory` — Factory framework, API, GPT bootstrap files
- `agent-skills-public` — public completed Skills/Flows/Suites
- `agent-skills-private` — confidential completed Skills/Flows/Suites

## Factory responsibilities

- Orchestrator: request classification, Creation Gate, visibility-aware Registry Search, Candidate Skill Inspection, Reuse Boundary Check, Capability Gap Plan, runtime routing
- Architect: verify reuse/extension/create boundaries, independent-responsibility tests, dependent impact, Flow-first design, representability
- Author: implement only approved Registry changes
- Reviewer: independently enforce search/inspection/boundary/gap/visibility/representability/regression gates
- Publisher: private → public-safe conversion

## Routing and mutation authorization

Read-only `use`, `audit`, ordinary/meta bypass Creation Gate. Mutation-oriented `create`, `refactor`, `split`, `merge`, `publish`, `rollback` require explicit authorization before persistence.

## Registry-first Build Pipeline

Explicit create follows:

`Creation Gate → Registry Search → Candidate Skill Inspection → Reuse Boundary Check → Capability Gap Plan → Architect → Author → Reviewer`

### Registry Search visibility

- private target: search public + private Skills and, when relevant, public + private Flows; private objects may reuse either.
- public target: direct reuse is public-only; private source requires publisher/public-safe handling.
- unresolved visibility: do not finalize gaps from one Registry; visibility is explicit before authoring/writes.

### Candidate Skill Inspection

Search metadata is not boundary evidence. A strong candidate Skill must be loaded with `getSkill` before deciding a capability gap.

Inspect responsibility/scope, trigger/non-trigger, workflow/supported modes, review/diagnostic/revision stages, inputs/outputs, quality gate, failure modes, handoffs, and explicit boundary/non-split rules.

A capability can be owned inside a Skill even when absent from its title/description. Supported modes, workflow steps, review stages, diagnostic stages, and output variants are part of the ownership analysis.

### Reuse Boundary Check

Before Capability Gap Plan finalization:

1. **Existing ownership:** if a capability is already a legitimate part of an existing coherent Skill workflow, reuse that Skill; do not extract the sub-step.
2. **Partial fit:** if the capability naturally belongs inside the existing responsibility but coverage is incomplete, consider backward-compatible extension before creation.
3. **Independent responsibility:** create only when the capability has an independent user goal, independently useful output, independent cross-workflow reuse value, and is not merely an internal implementation/sub-step.
4. **Explicit non-split:** `do not split`, `keep X and Y in one workflow`, and equivalent declarations are authoritative for ordinary create. Changing them requires explicit refactor/split.

If one existing Skill already satisfies the requested reusable workflow, reuse it alone. Do not create a Flow merely to externalize that Skill's internal stages.

### Capability Gap Plan evidence

Each capability records:

- capability
- disposition (`reuse` / `extend` / `create` / `model` / `external_tool`)
- candidateSkills
- inspectedCandidates
- boundaryDecision
- supportingEvidence
- splitJustification for create
- targetVisibility
- searchedScopes

`create` is blocked unless splitJustification explains why inspected candidates do not already own the capability and demonstrates independent user goal, output, and reuse value.

### Extension safety

Persisted existing-Skill changes inspect responsibility/contract and dependents when available:

- public Skill → public + private dependents;
- private Skill → private dependents.

Dependents inform compatibility, not automatic veto. Breaking changes require explicit refactor.

### Flow-first multi-capability design

- one coherent reusable responsibility → Skill
- genuinely multi-capability reusable process → Flow + independently reusable Skills
- temporary multi-Skill execution → dynamic compose

Flow-first runs after Reuse Boundary Check; it must not decompose one existing Skill's intentionally unified workflow.

### Flow v1 representability

Flow v1 supports only `exact_skill` and Skill-discovered `capability`. Unrepresentable required `model`/`external_tool` capabilities fail closed as `unsupported_flow_capability` or equivalent. No silent omission, fake Skill creation, hidden external tool, or unsupported step type.

Direct model/external-tool Flow steps remain unavailable in v1.

## Canonical regression example: human-writing-review

`human-writing-review` is expected to be inspected as a strong candidate for requests combining writing review/diagnosis and revision. When its current SKILL.md defines review, diagnosis, revision, business writing, formality/voice, and an explicit unified review+revision boundary, a request such as `敬語・文体の不整合チェックと自然なリライトができる仕組みを作って` should normally resolve to `reuse` of that Skill. The diagnostic sub-step must not be extracted into a new Skill, and no Flow should be created merely to mirror internal review → revision stages.

Changing that ownership boundary is refactor/split work, not ordinary create.

## Flow v2 MVP — model / tool first-class steps

Flow v2 is opt-in by manifest version and does not migrate or rewrite v1 Flows.

- `schema_version: 1` → `exact_skill`, `capability`
- `schema_version: 2` → `exact_skill`, `capability`, `model`, `tool`

The common DAG, handoff, condition, completion, and visibility rules remain shared. v1 exact/capability behavior is unchanged.

### model

A v2 `model` step represents Capability Gap Plan disposition=`model`. It requires non-empty instruction and expected outputs, uses the current host/runtime LLM without provider/model pinning, and is pure LLM-native execution. It may use only its instruction, Flow inputs, and resolved handoffs; it may not obtain web/API/connector/plugin/current external state.

### tool

A v2 `tool` step represents disposition=`external_tool`. `tool.mode=capability` provides portable runtime resolution; `tool.mode=exact` pins a tool and forbids silent substitution. `tool.effect=read_only|mutating` is a maximum effect, not a permission grant. Read-only fails closed if actual effect is mutating or unknown. Mutating remains subject to runtime authorization, user confirmation, and safety policy.

Build-time representability is separate from runtime availability. A capability-bound tool step may validate without a connected matching tool; runtime absence yields `TOOL_UNAVAILABLE`.

### Output integrity and failures

Only fields declared in `expected_output` are downstream contract fields. Missing required outputs yield `STEP_OUTPUT_INVALID`; missing tool data is never invented by a downstream model. Required-step failure prevents full success.

MVP runtime failure semantics include `SKILL_NOT_FOUND`, `TOOL_UNAVAILABLE`, `TOOL_AUTH_DENIED`, `MODEL_UNAVAILABLE`, `STEP_TIMEOUT`, and `STEP_OUTPUT_INVALID`. Limited transient retry is allowed for model/read-only tool steps; mutating tool automatic retry is disabled absent a future idempotency contract.

### Representability

For v2, `model` maps to a `model` step and `external_tool` maps to a `tool` step without schema-fitting Skills. `unsupported_flow_capability` remains for required nested Flow execution, loops, arbitrary code, explicit human-approval steps, or another unsupported primitive.

Canonical USD/JPY architecture is a required capability-bound read-only tool step producing `rate`, `change`, `comparison_basis`, `as_of`, `source`, followed by a required model step producing `comment`; no new Skill is required.

## Runtime execution paths

Exact Skill invocation, implicit discovery, recommend, dynamic compose, saved Flow execution, Suite contextual scope, and read-only audit/use remain unchanged. Failed ordinary-task discovery never transitions to create.

## Public/private boundary

Public Registry objects reference public only. Private Registry objects may reference public/private. Private content is never persisted publicly outside publisher workflow.

## Repository workflow

Mutation modes use non-main branches and branch → write → validate → diff → reviewer. Direct main writes are forbidden. PR creation remains explicit opt-in.

## API

Reuse Boundary Check v1 and Flow v2 use the existing Registry search/read/validate/preflight/write interfaces. No new backend endpoint or GPT Action operation is required.
