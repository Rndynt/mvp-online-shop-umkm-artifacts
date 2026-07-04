---
name: RukoLite duplicate workflow ports
description: Durable rule — after import, legacy + artifact-managed workflows collide on ports; only remove the legacy plain-named ones.
---

After a fresh import/clone, artifact registration auto-creates `artifacts/…`-prefixed workflows per service. If legacy plain-named workflows (same ports) still exist from `.replit`, both bind the same ports and fail on restart.

**Why:** `artifacts/…`-prefixed workflows are platform-protected and cannot be removed. The plain-named duplicates must be removed instead.

**How to apply:** Remove only the plain-named legacy entries via `removeWorkflow({name})`; then restart each `artifacts/…` workflow individually.
