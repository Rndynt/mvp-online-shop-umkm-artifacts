---
name: RukoLite payment config
description: How payment method configuration is stored and enforced across API and checkout
---

Payment method config is stored as a `payment_config` JSONB column on the `stores` table.

**Shape (PaymentConfig):** `{ qrisEnabled, qrisImageUrl?, bankTransferEnabled, bankAccounts: {bank, accountNumber, accountName}[] }`

**Default** is `DEFAULT_PAYMENT_CONFIG` from `lib/db/src/schema/stores.ts` — 3 hardcoded BCA/BNI/Mandiri entries, both methods enabled.

**API:** `GET /api/admin/payment-methods` and `PUT /api/admin/payment-methods` (service: `artifacts/api-server/src/services/payment-methods.service.ts`).

**Checkout enforcement:** `createOrder` in `checkout.service.ts` calls `getPaymentConfig()` once at the top and rejects disabled methods server-side with AppError.

**Validations:** at least one method must be enabled; if bankTransferEnabled=true, bankAccounts must be non-empty.

**Why:** bank accounts were hardcoded in checkout service; admin needed runtime control without code deploys.

**How to apply:** when adding new payment methods, extend PaymentConfig shape, add validation in updatePaymentConfig, add checkout guard in createOrder, add card to management page.
