# RukoLite — Online Shop UMKM MVP

A full-stack Indonesian UMKM (small business) online shop platform, built as a **pnpm monorepo** on Replit. Demo store: **Kopio** — a specialty coffee shop.

## Architecture

```
artifacts/
  api-server/     Express 5 REST API        → port 8080  (proxied at /api)
  shop/           React + Vite storefront   → port 24349 (proxied at /)
  management/     React + Vite admin panel  → port 24310 (proxied at /management/)
lib/
  db/             Drizzle ORM + PostgreSQL schema + seed
  shared/         Shared TypeScript types & constants
  api-zod/        Zod validation schemas for API
  api-client/     Fetch-based API client (framework-agnostic)
  api-client-react/ React Query wrappers
  api-spec/       OpenAPI spec
  object-storage-web/ Google Cloud Storage helpers
```

## Running the Project

Three workflows start automatically:
- **artifacts/api-server: API Server** — builds & starts the Express API
- **artifacts/shop: web** — Vite dev server for the storefront
- **artifacts/management: web** — Vite dev server for the management panel

## Database

Uses **Replit's managed PostgreSQL** (`DATABASE_URL` auto-injected).

```bash
# Push schema changes
pnpm --filter @workspace/db run push

# Re-seed demo data (Kopio coffee store, 12 products, shipping methods, discount code)
pnpm --filter @workspace/db run seed
```

Demo discount code: **NGOPI10** (10% off)

## Environment Variables

Set in Replit Secrets / Env Vars:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | auto | Managed by Replit |
| `SESSION_SECRET` | secret | Set as Replit Secret |
| `PORT` | `5000` | API listen port (remapped by Replit to 8080) |
| `CORS_ORIGIN` | comma-separated origins | Allowed CORS origins |
| `VITE_API_URL` | `/api` | API base URL for frontend |
| `NODE_ENV` | `development` | Runtime environment |

## Key Features

- **Storefront**: product listing, product detail with variants, cart drawer, checkout with shipping selection, QRIS payment confirmation
- **Management**: product CRUD, order management, discount codes, shipping methods, analytics, store template picker
- **Variants**: Shopify-style multi-dimensional product variants (e.g. grind type × weight)
- **Theming**: CSS custom properties via `@theme inline`; active storefront template persisted in DB

## User Preferences

- Keep existing monorepo structure (`artifacts/` + `lib/`)
- Use pnpm workspaces (not Turborepo)
- Indonesian locale (IDR currency, Bahasa Indonesia UI)
