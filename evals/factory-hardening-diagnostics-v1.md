# Factory hardening diagnostics v1 regression eval

API version: 0.9.0

| Regression | Setup | Expected result |
|---|---|---|
| nonexistent ref became generic 404 | Read existing path at nonexistent ref | structured `REF_NOT_FOUND`, HTTP 404, repo/ref/path present |
| file/ref 404 indistinguishable | Read missing file at existing ref, then same file at missing ref | first `FILE_NOT_FOUND`; second `REF_NOT_FOUND` |
| Connector 403 confused with Vercel PAT | Simulate/observe unrelated connector 403 and run Factory diagnostics | Factory auth is reported only from Factory GitHub `/user`; repo permission errors remain `REPOSITORY_PERMISSION_DENIED` |
| repositories not independently diagnosable | Run `GET /api/diagnostics` | separate factory/public/private entries with base-ref and reported permissions, no secrets |
| partial write | Batch valid file followed by invalid/secret file | `POST /api/preflight`/`write-files` rejects before first write |
| retry duplicate mutation | Retry create-branch and identical write with same operation intent | branch returns `already_exists`; file returns `already_applied`; no duplicate content change |
| stale SHA | write with outdated `expectedSha` | HTTP 409 `STALE_SHA`; no write |
| rate limit | GitHub 429 or exhausted rate-limit metadata | retry only bounded 429 path, then `RATE_LIMITED` with safe rate metadata |
| timeout | induced GitHub read/write timeout | bounded retry, then `UPSTREAM_TIMEOUT`; correlation IDs retained |

Additional assertions: 401/403/404/conflict are not blind-retried; 5xx/network are bounded-retried; compare includes `stale`; PR defaults to refusal when `behindBy > 0`; diagnostics write-test is never invoked by read-only diagnostics and reports branch cleanup.
