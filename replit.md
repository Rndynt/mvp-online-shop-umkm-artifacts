# RukoLite — Online Shop UMKM MVP

A full-stack online shop for Indonesian small businesses (UMKM), with a React storefront, Express API, and management placeholder. Built as a pnpm monorepo on Replit.

## Run & Operate

All three services start automatically via configured workflows:

| Workflow | URL | Command |
|---|---|---|
| API Server | `/api` | `pnpm --filter @workspace/api-server run dev` |
| Shop (storefront) | `/` | `pnpm --filter @workspace/shop run dev` |
| Management | `/management/` | `pnpm --filter @workspace/management run dev` |

Other useful commands:
- `pnpm install` — install all dependencies (run after git pull)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev)
- `pnpm --filter @workspace/db run seed` — seed demo products, shipping, discounts
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Required Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (auto-provided by Replit) |
| `SESSION_SECRET` | Secret for session signing (set in Replit Secrets) |

## Stack

- **Monorepo**: pnpm workspaces, TypeScript 5.9, Node.js 24
- **API**: Express 5, Pino logging, Zod validation, esbuild bundler
- **DB**: PostgreSQL + Drizzle ORM (schema push, no migration files)
- **Frontend**: React + Vite + Tailwind CSS v4, Zustand, React Router v7
- **API contract**: OpenAPI spec → Orval codegen → typed hooks in `lib/api-client-react`

## Where Things Live

```
artifacts/
  api-server/   Express 5 backend (clean architecture modules)
  shop/         React+Vite storefront (/, /products/:slug, /checkout, /orders/:code)
  management/   Placeholder (login/CRUD not in MVP scope)
lib/
  db/           Drizzle schema + seed script
  shared/       Shared TypeScript types, constants, formatIDR()
  api-spec/     openapi.yaml — source of truth for API contract
  api-client/   Vanilla fetch client (typed by shared)
  api-client-react/  Orval-generated React Query hooks
  api-zod/      Drizzle-zod type exports
```

## Architecture Decisions

- **No Next.js**: Replit artifacts only support `react-vite`; the spec's Next.js/Fastify choices were adapted to React+Vite/Express 5
- **Fake QRIS**: Payment is demo-only (`manual_fake_qris`); no real payment gateway wired up in MVP
- **Backend recalculates totals**: Frontend cart is estimate-only; checkout endpoint re-fetches prices, shipping, and discounts from DB
- **Drizzle push (not migrate)**: Dev uses `drizzle-kit push` for simplicity; add migration files before production
- **Orval codegen**: API client hooks are generated from `lib/api-spec/openapi.yaml` — edit the spec, run codegen, never edit generated files directly

## Demo Data (seed)

- **Store**: RukoLite (slug: `rukolite`, teal primary)
- **Products**: Tas Kanvas Handy, Pouch Kulit Multifungsi, Tumbler Stainless Slim, Notebook Dot Grid A5
- **Shipping**: Standard (Rp 15.000), Express (Rp 30.000)
- **Discount**: `HEMAT10` — 10% off

## ROADMAP Status

See `ROADMAP.md` for the full checklist. As of import:
- Phase 0 (docs) ✅ — Phase 1 (structure) 🔄 — Phases 2–7 ⏳

## User Preferences

_Populate as you learn — explicit instructions worth remembering across sessions._

## Gotchas

- Run `pnpm install` before starting workflows on a fresh clone
- `pnpm --filter @workspace/db run push` + `seed` must be run once before the API returns real data
- The mockup-sandbox workflow (`/__mockup`) is only needed for Canvas/design exploration
- Theme colors are applied as CSS vars via `@theme inline`; use `bg-primary` etc., not hardcoded Tailwind colors
- After import, check for duplicate workflow names — artifact-managed workflows can collide with legacy ones
