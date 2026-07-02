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
