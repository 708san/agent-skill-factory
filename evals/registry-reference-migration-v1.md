# Explicit Registry reference migration v1 source-level matrix

Migration is explicit and scoped to one dependent Registry visibility/ref per request. Planning is read-only. Apply never creates the destination or deletes the source.

| Case | Expected source-level behavior |
|---|---|
| A | Public Skill rename to public: matching public Flow `exact_skill` changes only its structured `skill` reference name; implicit/explicit visibility semantics are preserved. |
| B | Public Skill rename with private Flow explicit-public dependent: private dependent scope is allowed and explicit public visibility remains explicit. |
| C | Private Skill to public Skill from a private Flow implicit-private reference: proposed reference adds `visibility: public` because owner inheritance would otherwise stay private. |
| D | Public Skill to private Skill: private dependent scope is allowed; public dependent scope returns `blocked: true`, `reason: visibility_incompatible`, and performs no write. |
| E | Flow rename: only Suite `members.flows` references discovered by `findRegistryDependents()` are rewritten. |
| F | Flow visibility migration: Suite member visibility is updated explicitly only as required by existing explicit/implicit semantics. |
| G | Destination does not exist: endpoint inspection returns blocked `destination_unavailable`; apply cannot write. |
| H | Invalid destination ref/API failure: destination inspection fails closed; apply cannot write. |
| I | Apply requires `expectedFiles[path]` equal to the fresh plan SHA and uses GitHub Contents API write with that SHA; stale/missing/unexpected plan entries block before writes. |
| J | Capability queries, descriptions, tags, metadata, and unrelated strings are never selected as migration targets; only `exact_skill`, `members.skills`, and `members.flows` locations returned by reverse dependency discovery are changed. |
| K | Each dependent manifest is validated before write and the proposed manifest is revalidated; cross-ref endpoint existence is checked at explicit endpoint ref while unrelated references retain dependent ref validation. Post-write manifests are re-fetched and validated again. |
| L | Apply re-runs `findRegistryDependents()` for the old identity and returns `remaining_old_dependency_count`; a fully migrated scope is successful only when that count is zero. |
| M | Migration never deletes the source; if old dependencies remain in any required delete scope, the existing dependency-aware delete guard continues to block source deletion. |
| N | Once all required dependent scopes have been migrated and old reverse dependencies are zero, the unchanged delete guard lifecycle can permit source deletion after its own complete scans. |
| O | Skill/Flow/Suite list/get/search/validate routes and implementations are unchanged by this feature. |
| P | `getRegistryDependents`, `findRegistryDependents()`, and dependency-aware delete guard implementation are unchanged; migration consumes them without weakening their rules. |
| Q | Existing branch/write/delete/history/compare/PR routes remain present. The only GitHub write addition is a CAS-style `putTextFileIfSha()` helper used by migration apply. |

## Request invariants

- `targetType`, source `{name, visibility, ref}`, destination `{name, visibility, ref}`, `dependentVisibility`, and `dependentRef` are all explicit.
- Public dependent scope may migrate only to a public destination.
- Private dependent scope may migrate to public or private destinations.
- Plan performs no write.
- Apply requires a plan-derived SHA map and does not create/delete Registry objects.
- There is no force migration, publish hook, rename magic endpoint, persistent dependency index, capability rewrite, or metadata replacement.

## Partial failure

Writes are preflighted together, then applied sequentially with per-file SHA compare-and-swap. Cross-repository atomic transactions are intentionally out of scope. A write failure returns `partial_failure`, the writes completed so far, post-state validation, and remaining old dependencies; the source is never deleted automatically.
