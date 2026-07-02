---
name: RukoLite API contract
description: Exact API paths, response shapes, and payment enum used across backend routes and generated client
---

## API Paths (must match OpenAPI spec at lib/api-spec/openapi.yaml)
- GET /api/storefront (NOT /api/store)
- GET /api/products
- GET /api/products/:slug
- GET /api/shipping-methods (NOT /api/shipping)
- POST /api/checkout
- GET /api/orders/:orderCode
- POST /api/orders/:orderCode/payment-confirmation

## Response Envelope
ALL successful responses MUST be wrapped: `{ data: <payload> }`
ALL error responses: `{ error: { code: string, message: string } }`

## Payment Method Enum
Must use `"manual_fake_qris"` (not `"qris"`) — defined in OpenAPI spec enum.

## Frontend Hook Return Types
Generated hooks (lib/api-client-react) return the full envelope, so frontend must:
- `useGetStorefront().data?.data` → StorefrontResponse
- `useListProducts().data?.data` → ProductListItem[]
- `useGetProductBySlug(slug).data?.data` → ProductDetail
- `useListShippingMethods().data?.data` → ShippingMethod[]
- `createCheckout.mutateAsync(payload)` → CreateCheckout201 → `.data.orderCode`
- `useGetOrderByCode(code).data?.data` → OrderResponse

**Why:** OpenAPI spec defines `{ data: ... }` envelope for all routes. Orval generates types that wrap the response. Breaking this contract causes runtime failures that are silent (TypeScript doesn't catch envelope mismatches in some cases).
