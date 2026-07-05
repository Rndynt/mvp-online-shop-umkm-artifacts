---
name: RukoLite object storage
description: How image uploads (product photos, store logo) are wired and what was needed to make them actually work
---

The codebase already contained a full presigned-URL upload implementation (`ObjectStorageService`, `/api/storage/uploads/request-url`, `ImageDropzone` in `lib/object-storage-web`, used by Management's product form and store settings) — but no bucket was ever provisioned, so `PUBLIC_OBJECT_SEARCH_PATHS`/`PRIVATE_OBJECT_DIR` env vars were unset and uploads would fail.

Additionally, the `/storage/objects/*` serving route was a placeholder that unconditionally returned 401 pending an auth layer that doesn't exist in this app.

**Why:** This app has no user authentication system, and all uploaded assets (product photos, store logo, QRIS image) are public storefront content, not private/user-scoped data.

**How to apply:** When object storage code exists but isn't working, first check whether the bucket has actually been provisioned (env vars set) before debugging the app code. For this app specifically, `/storage/objects/*` intentionally serves files without an auth/ACL check — do not add auth gating there unless the app later introduces genuinely private, per-user files.
