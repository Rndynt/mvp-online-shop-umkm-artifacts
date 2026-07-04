---
name: RukoLite duplicate workflow ports
description: Why "Project" workflow restart fails with EADDRINUSE and how to fix it
---

After a fresh import/clone, `listWorkflows()` may show two sets of workflows for the same services: plain names (`API Server`, `shop`, `management`, `mockup-sandbox`) defined as legacy standalone entries, and artifact-managed ones (`artifacts/api-server: API Server`, `artifacts/shop: web`, etc.) auto-created by artifact registration. Both bind the same ports, so starting the "Project" parent workflow causes `EADDRINUSE` failures.

**Why:** Artifact registration auto-creates its own workflow per service; if legacy `.replit`-defined workflows with the same ports still exist, they collide with the artifact-managed ones on restart.

**How to apply:** The `artifacts/...`-prefixed workflows cannot be removed via `removeWorkflow` (platform-protected). Instead remove the plain-named legacy duplicates with `removeWorkflow({name})`, then `restart_workflow` each `artifacts/...` workflow individually. Also run `pnpm install` (node_modules often missing after import) and `pnpm --filter @workspace/db run push` + `run seed` to get the DB ready.
