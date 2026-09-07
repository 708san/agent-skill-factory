# Flow v2 MVP — model / tool first-class steps evals

## Compatibility

1. Existing valid Flow v1 `exact_skill` → PASS; exact no-substitution preserved.
2. Existing valid Flow v1 `capability` → PASS; Skill discovery preserved.
3. `schema_version:1` with `model` step → FAIL invalid step type for v1.
4. `schema_version:1` with `tool` step → FAIL invalid step type for v1.

## Model

5. Valid v2 model step with instruction, handoff, non-empty expected_output → PASS.
6. Model step without non-empty instruction → FAIL.
7. Model step defining any of `skill`, top-level `capability`, `tool`, or `arguments` → FAIL.
8. Runtime model step may use only instruction + Flow inputs + input_handoff; attempting web/API/connector/current-state retrieval is prohibited and must not be treated as a valid pure model execution.

## Tool

9. Valid v2 capability-bound `read_only` tool → PASS.
10. Valid v2 exact-bound tool → PASS syntax/shape; availability checked at runtime when no authoritative tool catalog exists.
11. Invalid tool mode → FAIL.
12. capability mode + `tool.name` → FAIL.
13. exact mode + `tool.capability` → FAIL.
14. missing/invalid effect → FAIL.
15. runtime: Flow effect=`read_only` + actual mutating or unknown-effect tool → BLOCK / `TOOL_AUTH_DENIED`.
16. runtime: exact tool unavailable → no substitution / `TOOL_UNAVAILABLE`.

## Handoff / completion

17. Tool declares `rate/change/comparison_basis/as_of`; dependent model handoff references those fields and depends_on tool → PASS.
18. Handoff or completion references undeclared upstream output → FAIL validation.
19. Required model/tool step runtime failure → Flow full success false; never auto-delete/optionalize/replace.
20. Runtime step result missing required expected output → `STEP_OUTPUT_INVALID`; only declared outputs enter downstream contract.

## Security

21. mutating tool obeys normal platform/tool auth, confirmation, and safety; Flow manifest grants no permission and automatic retry is off absent idempotency contract.
22. `skip_confirmation`, `auto_approve`, `bypass_auth` on tool step/tool object → FAIL validation; equivalent bypass semantics are prohibited.

## Architecture

23. USD/JPY Production Test 3 request: current rate/change retrieval → `external_tool`; short Japanese comment → `model`; choose Flow v2; represent as required capability-bound read-only tool → required model; new Skill none; authoring allowed even when matching tool is not connected at build time.
24. Required nested Flow, loop, arbitrary code, explicit human-approval step, or other unsupported primitive → `unsupported_flow_capability` and fail closed before Author.

## Canonical v2 manifest

The following must validate as Flow v2 and create no Skill:

```json
{
  "schema_version": 2,
  "kind": "flow",
  "name": "usd-jpy-market-comment",
  "description": "Fetch current USD/JPY market data and generate a short Japanese market comment.",
  "inputs": [],
  "steps": [
    {
      "id": "fetch-rate",
      "type": "tool",
      "required": true,
      "depends_on": [],
      "tool": {
        "mode": "capability",
        "capability": "Retrieve current USD/JPY rate and recent change from an external financial data source",
        "effect": "read_only"
      },
      "arguments": { "base": "USD", "quote": "JPY" },
      "input_handoff": {},
      "expected_output": ["rate", "change", "comparison_basis", "as_of", "source"]
    },
    {
      "id": "generate-comment",
      "type": "model",
      "required": true,
      "depends_on": ["fetch-rate"],
      "instruction": "Use only the supplied market data to write a concise 2-3 sentence Japanese comment. Do not invent unsupported market movements or causes.",
      "input_handoff": {
        "rate": "steps.fetch-rate.rate",
        "change": "steps.fetch-rate.change",
        "comparison_basis": "steps.fetch-rate.comparison_basis",
        "as_of": "steps.fetch-rate.as_of"
      },
      "expected_output": ["comment"]
    }
  ],
  "completion": {
    "required_steps": "all_required",
    "outputs": {
      "rate": "steps.fetch-rate.rate",
      "comment": "steps.generate-comment.comment"
    }
  }
}
```

## Regression

Reuse Boundary Check v1 remains intact: ordinary task no mutation; strong candidate SKILL.md inspection; existing internal responsibility reuse; partial fit extend-first; create splitJustification. Preserve public/private Registry boundaries, dependent scanning, whole-batch preflight, stale SHA protection, exact Skill semantics, saved Flow routing, dynamic compose, Suite semantics, and API operation count.
