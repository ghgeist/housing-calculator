# Housing Calculator (Own vs Rent Decision Tool)

A lightweight React + TypeScript tool for evaluating a **primary residence as a leveraged consumption system**.

This app is intentionally **not** a generic mortgage calculator. It focuses on decision clarity:
- true monthly cost of ownership (consumption cost)
- monthly ownership premium vs equivalent rent
- carry status: Positive Carry / Near Neutral / Negative Carry
- Own vs Rent + Invest comparison over a holding period

## Why this differs from a generic mortgage calculator

Generic calculators often emphasize total payment and equity growth without clearly separating:
- **consumed housing cost** (interest, tax, maintenance, insurance), vs
- **equity conversion** (principal paydown).

This tool keeps that distinction explicit so users can answer:
> “Am I overpaying to own this house relative to renting an equivalent place?”

## Core assumptions

- **True ownership cost** includes:
  - mortgage interest
  - property tax
  - maintenance reserve
  - insurance
- **Principal paydown is excluded** from true monthly ownership cost.
- Carry analysis uses:
  - imputed rent yield = annual rent / home price
  - carry drag = mortgage rate × LTV + tax rate + maintenance rate + insurance rate
- Own vs Rent + Invest compares cumulative net cost over the selected holding period.
- Yearly property tax and maintenance can be modeled on either purchase price (default) or current appreciated value.

## Project layout (app)

Main app lives at: `artifacts/housing-sanity-check`

Key folders:
- `src/components/` UI and presentation
- `src/lib/housing/` pure housing model functions
- `src/lib/` app utilities/default values
- `src/types/` domain types

## Run locally

From repo root:

```bash
pnpm install
```

Run the housing app (from repo root):

```bash
pnpm dev
```

Or from `artifacts/housing-sanity-check`: `pnpm dev`.

Optional: set `PORT` (default `5173`) and `BASE_PATH` (default `/`) if the host assigns different values.

Build:

```bash
pnpm --filter @workspace/housing-sanity-check run build
```

## Tests and lint

From repo root (runs Vitest for the whole workspace):

```bash
pnpm test:run
```

Housing app tests only:

```bash
pnpm --filter @workspace/housing-sanity-check run test
```

Lint:

```bash
pnpm lint
```

Typecheck app package:

```bash
pnpm --filter @workspace/housing-sanity-check run typecheck
```

## What still needs work

- Add one integration-level test that verifies the new tax/maintenance basis switch changes chart outcomes end-to-end.
- Validate whether annual insurance should also have an optional inflation/appreciation mode for long holding periods.
- Improve scenario preset naming for non-US users.
