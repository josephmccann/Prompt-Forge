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

### PromptForge (`artifacts/promptforge`)
A client-side SPA that helps non-technical users turn vague ideas into structured AI prompts. Runs 100% in the browser with no external API calls.

- **Tech**: React + TypeScript + Vite + Tailwind CSS
- **Auth**: Simple password gate using `VITE_APP_PASSWORD` env var (default: `promptforge2024`)
- **Storage**: localStorage for history persistence
- **Theme**: Dark mode only, teal accent (#14b8a6)
- **Screens**: Password Gate, Input Form, Clarification (conditional), Prompt Output (3 variants), History
- **Core Logic**: Deterministic template-based prompt builder, rule-based scoring engine, vagueness detection

Key files:
- `src/lib/auth.ts` — Password authentication
- `src/lib/promptBuilder.ts` — Template-based prompt generation (3 variants: Balanced, Concise, Maximum Control)
- `src/lib/clarificationEngine.ts` — Vagueness detection and question selection
- `src/lib/scoringEngine.ts` — Deterministic scoring (Clarity, Specificity, Completeness, Reliability)
- `src/lib/storage.ts` — localStorage CRUD for history (max 50 entries, FIFO)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
