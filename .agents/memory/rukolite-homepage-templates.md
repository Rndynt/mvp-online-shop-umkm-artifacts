---
name: RukoLite homepage template system
description: How the multi-template homepage feature is wired between shop, api-server, and management.
---

The shop's active homepage template is a persisted store setting (`stores.homepage_template`, default `"basic"`), not just a frontend query param.

- Source of truth: `storesTable.homepageTemplate` column, exposed via `/api/storefront` (`StorefrontResponse.homepageTemplate`) and `/api/admin/settings` (get/put).
- Shop's `home.tsx` resolves the rendered template as: `?template=` query override (if present) > store's persisted `homepageTemplate` from `useGetStorefront()` > fallback `"basic"`. The query override is only a quick manual preview mechanism (floating button UI), not the primary control.
- Management owns the real control: a dedicated "Kelola Template" page (`/templates`) with visual cards lets the store owner pick and persist the active template via PUT `/api/admin/settings`.
- Valid template ids are validated server-side against `HOMEPAGE_TEMPLATES` in `store.service.ts` — adding a new template requires updating that list plus the shop's template map and the management page's `TEMPLATE_OPTIONS`.

**Why:** the user explicitly wants store owners to eventually choose homepage layouts from Management, not via URL tricks; a query-only toggle was rejected as unintuitive for a non-technical user.

**How to apply:** when adding a new homepage template, update all three: DB-backed `HOMEPAGE_TEMPLATES` (api-server), the shop's template registry (`home.tsx`/`template-preview.tsx`), and Management's `templates.tsx` options. Remember the api-server runs a build+start dev script — restart its workflow after backend/service changes, since it doesn't hot-reload.
