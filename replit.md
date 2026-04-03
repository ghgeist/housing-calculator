# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Housing Sanity Check (`artifacts/housing-sanity-check`)
- React + TypeScript client-side-only app
- Own vs. Rent decision clarity tool — models a primary residence as a leveraged consumption system
- No backend required; all computation runs in the browser
- Key files:
  - `src/lib/model.ts` — pure math: mortgage amortization, carry analysis, own vs rent+invest comparison
  - `src/lib/types.ts` — shared TypeScript types
  - `src/lib/defaults.ts` — default inputs and preset scenarios
  - `src/lib/format.ts` — currency/percent formatting utilities
  - `src/components/InputsPanel.tsx` — all user inputs with tooltips and preset buttons
  - `src/components/ResultsPanel.tsx` — hero metric, carry badge, breakdown detail
  - `src/components/ComparisonChart.tsx` — recharts line chart for own vs rent+invest over time
  - `src/app.css` — custom CSS (calm, analytical design, warm off-white palette)
- Preview path: `/`

### API Server (`artifacts/api-server`)
- Express 5 server
- Preview path: `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
