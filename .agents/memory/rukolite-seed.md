---
name: RukoLite seed
description: How to run the database seed for RukoLite
---

## Running seed
```
pnpm --filter @workspace/db run seed
```

Requires `tsx` in lib/db devDependencies (catalog version `^4.21.0`).

## Seed data
- 1 store: RukoLite (slug: `rukolite`, color: `#0F766E`)
- 4 products: Tas Kanvas Handy, Pouch Kulit Multifungsi, Tumbler Stainless Slim, Notebook Dot Grid A5
- 2 shipping methods: JNE Reguler (Rp 18.000), J&T Express (Rp 25.000)
- 1 discount code: HEMAT10 (10% percentage)

## Idempotency
Seed checks if storesTable has rows; if yes, exits immediately. Safe to run multiple times.

**Why:** The seed script uses `crypto.randomUUID()` for IDs (Node 18+ built-in), so no external UUID library needed.

## Verifying seed image URLs
Never hand-write/guess Unsplash photo IDs for seed data — many guessed IDs 404 even though the format looks plausible. Always get URLs from `imageSearch` (image-search skill) or curl-verify every URL with `curl -s -o /dev/null -w "%{http_code}"` before writing them into seed.ts.

**Why:** Several hand-typed Unsplash IDs in an earlier pass returned 404, and separately several IDs that did resolve depicted the wrong subject (e.g. latte art for a digital scale, finished drink shots for equipment) — both problems are only caught by search + verification, not by guessing.

**How to apply:** For any e-commerce seed with product photos, batch-search per product category via `imageSearch`, curl-verify the shortlist, then assign — do this before writing seed.ts, not after.

## Store logos in seed
For an AI-generated logo referenced by `stores.logoUrl`, save the PNG into the frontend's `public/` folder (e.g. `artifacts/shop/public/logo.png`) and reference it by root-absolute path (e.g. `/logo.png`), not by a hosted stock photo. Because Replit's proxy routes root-level paths to whichever service owns `/`, a root-absolute path resolves correctly across sibling frontends on different base paths (e.g. also displays correctly in a `/management/`-mounted panel).
