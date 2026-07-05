---
name: RukoLite duplicate workflow ports
description: Durable rule — after import, legacy + artifact-managed workflows collide on ports; only remove the legacy plain-named ones.
---

After a fresh import/clone, artifact registration auto-creates `artifacts/…`-prefixed workflows per service. If legacy plain-named workflows (same ports) still exist from `.replit`, both bind the same ports and fail on restart.

**Why:** `artifacts/…`-prefixed workflows are platform-protected and cannot be removed. The plain-named duplicates must be removed instead.

**How to apply:** Remove only the plain-named legacy entries via `removeWorkflow({name})`; then restart each `artifacts/…` workflow individually.

**Update:** the project since migrated the storefront from `artifacts/shop` (Vite) to `artifacts/shop-next` (Next.js). `artifacts/shop` is now a stray leftover artifact not listed in `.replit`'s official `[workflows]` config and binds no needed port — if it's running it just wastes resources; kill its process (`pkill -f "filter @workspace/shop run"`) rather than trying to "fix" it. Only `shop-next`, `api-server`, and `management` are the real three services now.

## Update: legacy `artifacts/shop: web` cannot be deleted
The platform refuses `removeWorkflow` on artifact-managed workflows (`PROHIBITED_ACTION`). It's fine to leave it in "failed/stopped" state — it is NOT in `.replit`'s `[[workflows.workflow]]` "Project" run list (only shop-next/api-server/management are), so it never auto-starts on repl boot or Run-button click. Do not call restart_workflow on it again.
