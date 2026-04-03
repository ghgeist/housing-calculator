# Documentation

Product thinking, feedback, and reference memos for this repo. **Code expectations and how to run the app** stay in the root [`AGENTS.md`](../AGENTS.md) and [`README.md`](../README.md).

## Start here

| Document | What it is | When to read |
| -------- | ---------- | ------------ |
| [`2026-04-03-roadmap.md`](2026-04-03-roadmap.md) | Staged product direction (v1 → market-aware → property-aware). | Planning what to build next; scope checks. |
| [`2026-04-03-external-feedback.md`](2026-04-03-external-feedback.md) | Qualitative feedback and possible directions (not spec). | Sanity-checking UX/copy; tracing “why we said X.” |
| [`2026-04-03-memo-on-mortgages.md`](2026-04-03-memo-on-mortgages.md) | Long-form framing: housing as leveraged consumption / carry. | Deep context for metrics and tone; not required to ship UI. |

**Returning after a break:** skim this table, then roadmap if you’re choosing work, or external feedback if you’re tuning trust/copy.

## Conventions

- **Filenames:** `YYYY-MM-DD-short-slug.md` so related notes sort chronologically and stay grep-friendly.
- **Scope:** These files do not change app behavior by themselves; they inform decisions. Implementation truth lives in code and tests.

## If this folder grows

Split only when it hurts to stay flat. A simple later layout:

- `docs/product/` — roadmap, feedback, decision logs  
- `docs/reference/` — long memos and external-style essays  
- `docs/archive/` — superseded dated docs (move, don’t delete history)

Until then, keep everything at `docs/` top level and use this README as the map.
