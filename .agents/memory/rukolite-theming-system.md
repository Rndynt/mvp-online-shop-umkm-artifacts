---
name: RukoLite shared theming system
description: How cross-app (shop + management) theming via CSS variables and Tailwind v4 works, and where the source of truth lives.
---

Theme colors (primary/secondary/accent) + logo are stored on the store record in the DB and served via the storefront/admin settings API. Both `shop` and `management` apps apply them at runtime by writing CSS custom properties onto `document` (via a shared `applyThemeToDocument`/`resolveThemeColors` helper in `@workspace/shared`), not by rebuilding Tailwind.

**Why:** Tailwind v4 apps define an `@theme inline` block in each app's `index.css` that maps `--color-primary: hsl(var(--primary))` etc. Utility classes like `bg-primary`/`text-primary`/`bg-accent` read from these CSS vars at paint time, so setting the vars on `document` re-themes the whole app live without a rebuild — but ONLY for components that use the theme-aware utility classes.

**How to apply:** Any new component must use `bg-primary`/`text-primary`/`bg-accent`/etc. — never hardcode a Tailwind color like `bg-teal-500` — or it will silently ignore the store's theme. When adding new UI, grep for hardcoded color classes before shipping.
