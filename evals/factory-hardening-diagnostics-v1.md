# Factory hardening diagnostics v1 regression eval

API version: 0.9.0

| Regression | Setup | Expected result |
|---|---|---|
| nonexistent ref became generic 404 | Read existing path at nonexistent ref | structured `REF_NOT_FOUND`, HTTP 404, repo/ref/path present |
| assert_ref GitHub 422 classification | Make `assert_ref` call GitHub `/commits/{ref}` with a definitely missing ref that returns 422 | structured `REF_NOT_FOUND`, never `FILE_CONFLICT` |
| missing ref HTTP status | Read using a missing ref that GitHub reports as 404 or 422 | Factory response is HTTP 404 with `REF_NOT_FOUND` |
| file/ref 404 indistinguishable | Read missing file at existing ref, then same file at missing ref | first `FILE_NOT_FOUND`; second `REF_NOT_FOUND` |
| Connector 403 confused with Vercel PAT | Simulate/observe unrelated connector 403 and run Factory diagnostics | Factory auth is reported only from Factory GitHub `/user`; repo permission errors remain `REPOSITORY_PERMISSION_DENIED` |
| repositories not independently diagnosable | Run `GET /api/diagnostics` | separate factory/public/private entries with base-ref and reported permissions, no secrets |
| partial write | Batch valid file followed by invalid/secret file | `POST /api/preflight`/`write-files` rejects before first write |
| same-batch new Skill referenced by new Flow | Submit one `write-files`/`preflight` batch containing `skills/<new>/SKILL.md` and a new Flow exact step referencing that Skill with the same effective visibility | preflight PASS; proposed Skill resolves from the batch overlay before any write |
| same-batch new Flow referenced by new Suite | Submit one batch containing a valid new `flows/<new>/FLOW.json` and a new Suite containing that Flow as a member with the same effective visibility | preflight PASS; proposed Flow resolves from the batch overlay before any write |
| truly missing same-batch reference | Submit a Flow/Suite that references a Skill/Flow absent from both the target ref and proposed batch overlay | preflight FAIL before first write; no partial mutation |
| stale later file blocks whole batch | Submit a valid first file followed by a second file whose string `expectedSha` is already stale at preflight start | HTTP 409 `STALE_SHA`; first write never starts and no file in the batch is mutated |
| create-only precondition caught before write | Submit `expectedSha:null` for an already existing file | preflight HTTP 409 `FILE_CONFLICT`; no write starts |
| expected SHA for missing file caught before write | Submit string `expectedSha` for a missing file | preflight HTTP 409 `STALE_SHA`; no write starts |
| preflight identical content plan | Submit content identical to the current file state | preflight marks that file `already_applied`; write phase retains its own race-safe check |
| retry duplicate mutation | Retry create-branch and identical write with same operation intent | branch returns `already_exists`; file returns `already_applied`; no duplicate content change |
| identical branch re-create | Re-run create-branch for a branch whose head equals the requested base current SHA | `already_exists`, `aheadBy:0`, `behindBy:0`, `stale:false` |
| non-stale descendant re-create | Re-run create-branch for an existing branch descended from the requested base current SHA | `already_exists`; merge base equals requested base current SHA; `aheadBy >= 1`, `behindBy:0`, `stale:false` |
| stale same-name branch | Re-run create-branch where requested base advanced beyond the existing same-name branch | HTTP 409 `REF_ALREADY_EXISTS`; branch is not reused |
| diverged same-name branch | Re-run create-branch where existing same-name branch and requested base have diverged from an older merge base | HTTP 409 `REF_ALREADY_EXISTS`; branch is not reused |
| stale SHA | write with outdated `expectedSha` | HTTP 409 `STALE_SHA`; no write |
| rate limit | GitHub 429 or exhausted rate-limit metadata | retry only bounded 429 path, then `RATE_LIMITED` with safe rate metadata |
| timeout | induced GitHub read/write timeout | bounded retry, then `UPSTREAM_TIMEOUT`; correlation IDs retained |
| compact compare default | Compare a branch with a large multi-file diff without `includePatch` | response succeeds compactly and each file contains filename/status/additions/deletions only; no `patch` field |
| compare patch opt-in | Repeat compare with `includePatch=true` | patch is present only for files where GitHub supplies patch text |
| structured error correlation body | Trigger any authenticated API error | `ok:false`; `error.requestId` is present and matches `x-request-id`; mutation errors also carry `error.operationId` matching `x-operation-id` |
| mutation operation body | Run any mutation endpoint successfully | top-level `operationId` is present and matches `x-operation-id` |
| runtime semantics preserved | Inspect branch `gpt/INSTRUCTIONS.md` against main/orchestrator semantics | exact/discover/recommend/compose/ordinary-meta, Flow routing, Suite discovery scope, User control, Progressive Disclosure, public/private safety, and create/audit/refactor/split/merge/publish/rollback remain present |
| diagnostics write-test Preview routing | On a Preview deployment call public `POST /api/diagnostics/write-test` with auth and `confirm:true` | Vercel rewrite reaches Factory internal `/api/diagnostics-write-test`; response is from Factory, not Vercel `404 NOT_FOUND` |
| diagnostics write-test full lifecycle | Run the explicit Preview write-test | create branch → write temporary file → read back → delete file → delete branch completes; `readBack:true`, `cleanup.file:deleted`, `cleanup.branch:deleted`, no temporary branch/file remains |
| GPT Action operation limit | Count operations in Preview `/api/openapi`, dynamic `api/openapi.js`, and static `gpt/openapi.yaml` | exactly 30 operations in each Action schema; API version remains `0.9.0` |
| GPT Action schema parity | Compare operationId sets from dynamic and static OpenAPI | sets are identical; neither includes `healthCheck` nor `getSkillHistory` |
| backend-only health remains | Call backend `GET /api/health` even though it is absent from the Action schema | HTTP 200; backend endpoint remains available |
| backend-only skill history remains | Call authenticated backend `GET /api/skill-history` even though it is absent from the Action schema | route remains available; equivalent GPT Action use is `getRegistryHistory(target=skill)` |

Additional assertions: 401/403/404/conflict are not blind-retried; 5xx/network are bounded-retried; compare includes `stale`; PR defaults to refusal when `behindBy > 0`; diagnostics write-test is never invoked by read-only diagnostics and reports branch cleanup; default compare must not return file patches. Operation-aware GitHub classification must run before the generic 409/422 fallback for `assert_ref`, `create_branch`, and `put_file`. Existing-branch idempotent reuse additionally requires `merge_base_commit.sha === requested base current SHA` and `behindBy === 0`; inability to confirm that relationship must fail closed with HTTP 409 `REF_ALREADY_EXISTS`. Whole-batch preflight must resolve same-batch proposed Skill/Flow references without weakening visibility boundaries, and must complete all starting-state `expectedSha` checks before entering the first write; write-time SHA checks remain required to catch preflight-to-write races. GPT Action schema trimming must not delete or disable backend routes.
