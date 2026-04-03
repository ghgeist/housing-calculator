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

Typical commands should be:

- install dependencies
- run dev server
- run tests
- build project

If scripts are missing or unclear, add the minimum needed to make the repo easy to run.

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
