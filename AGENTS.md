# AGENTS.md

## Project purpose

This repo contains a small React + TypeScript web app called `housing-calculator`.

The app is not a generic mortgage calculator. It is a decision tool for comparing owning vs renting by modeling a primary residence as a leveraged consumption system.

The main user-facing question is:

> Am I overpaying to own this house relative to renting an equivalent place?

## Core product insight

The app should make these ideas visible:

- true monthly ownership cost
- monthly ownership premium vs equivalent rent
- carry classification:
  - Positive Carry
  - Near Neutral
  - Negative Carry
- Own vs Rent + Invest comparison over time

## Key conceptual rules

- Interest is a true ownership cost.
- Property tax is a true ownership cost.
- Maintenance is a true ownership cost.
- Insurance is a true ownership cost.
- Principal paydown is not a consumption cost in the “true monthly cost” metric. It is equity conversion.
- Do not casually blur the distinction between consumed cost and equity.

## Architecture expectations

Prefer a simple structure:

- `src/components` for UI
- `src/lib` for model logic and helpers
- `src/types` for shared types if needed

Keep core calculations in pure functions so they are easy to test.

## Scope discipline

Do not add:
- backend
- auth
- database
- account system
- unnecessary infrastructure

Do not overengineer.

This project should stay small, readable, and easy to resume.

## Safe areas for change

Okay to improve:
- code organization
- naming
- test coverage
- documentation
- small UI clarity improvements
- mathematical clarity if explicitly documented

Be cautious changing:
- core framing
- metric definitions
- carry classification logic
- how “true monthly cost” is defined

## Development

Use the existing package manager and scripts in the repo.

**Package manager:** this workspace uses **pnpm** only (`preinstall` rejects npm/yarn). Use `pnpm install` from the repo root.

Typical commands from the **repo root**:

- `pnpm install` — install dependencies
- `pnpm typecheck` — TypeScript across projects
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm test` / `pnpm test:run` — Vitest (all tests; `test:run` is CI-friendly)
- `pnpm build` — build (as defined in root `package.json`)

Tests live next to source under `artifacts/**`, `lib/**`, or `scripts/**` as `*.test.ts` / `*.test.tsx` (or `*.spec.*`). Vitest is configured at the root; **`pnpm test` runs from the root**, not from `npm` inside a single package.

### `artifacts/housing-sanity-check` (own vs rent UI)

The polished calculator UI may live under `artifacts/housing-sanity-check` (path and package name can vary).

- **Number fields:** `InputsPanel` uses a **draft string + commit on blur** pattern with `src/lib/numberInputCommit.ts`. Do not revert to `parseFloat` on every `onChange`; it breaks typing and empty fields.
- **Reset / dirty checks:** use `housingInputsEqual` from `src/lib/housingInputsEqual.ts` instead of hand-comparing each field of `HousingInputs` (avoids silent bugs when the type gains a property).
- **Tests:** from that package, `pnpm test` delegates to the root Vitest run for this artifact only (`pnpm -w exec vitest run artifacts/housing-sanity-check`). Prefer **Vitest** (`expect` from `vitest`); do not use `node:test` for new tests.
- **Mobile layout contract:** keep split layout at `>=861px`, stacked layout at `<=860px`. If you change this contract, update the Playwright mobile regression test in the same change.
- **Section anchors:** keep section IDs centralized in `src/lib/sectionAnchors.ts`; keep mobile quick-jump targets aligned with those constants.
- **Mobile regression tests:** run `pnpm test:mobile` from repo root when touching `App.tsx`, layout CSS, `InputsPanel`, `ResultsPanel`, or chart layout.
- **E2E naming:** keep Playwright files in `artifacts/housing-sanity-check/e2e/` as `*.e2e.ts` so Vitest does not pick them up.

## Documentation expectations

Keep README concise and useful.
Document:
- purpose
- assumptions
- how to run
- how to test
- open limitations

## Coding style

- Prefer simple, explicit code.
- Prefer pure functions for business logic.
- Avoid clever abstractions unless they clearly reduce complexity.
- Add comments only where they clarify reasoning.
- Keep changes easy for a future agent or human to pick up quickly.

## Priority order

1. correctness
2. clarity
3. maintainability
4. polish
