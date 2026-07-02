# ROADMAP — Online Shop UMKM MVP (RukoLite)

> **Status**: 🔄 In Progress  
> **Diperbarui**: 2026-07-02  
> **Referensi**: `attached_assets/document-2026-07-02T13-24-19-952Z_1782998681076.md`

---

## ⚙️ Adaptasi Environment (Replit)

> Beberapa penyesuaian dilakukan karena keterbatasan Replit. Ini bukan perubahan arsitektur, hanya adaptasi runtime/scaffold:

| Spesifikasi Dokumen | Adaptasi Replit | Alasan |
|---|---|---|
| Next.js App Router | React + Vite (SPA) | Replit artifact hanya support `react-vite`, `expo`, `slides`, `video-js` |
| Fastify | Express 5 | Existing `artifacts/api-server` sudah Express 5, clean architecture tetap sama |
| Turborepo | Plain pnpm workspaces | Turbo tidak diperlukan untuk MVP scope ini |
| `apps/` folder | `artifacts/` folder | Replit workspace convention |
| `packages/` folder | `lib/` folder | Replit workspace convention |
| `packages/config` | Dihilangkan | Tidak esensial untuk MVP, bisa ditambah nanti |

---

## 📋 PHASE 0 — ROADMAP & Dokumentasi

- [x] Baca dan analisa dokumen spesifikasi lengkap
- [x] Baca screenshot referensi UX (myfloatski.com — products, cart, detail, checkout)
- [x] Buat file ROADMAP.md ini dengan checklist
- [x] Dokumentasi adaptasi environment
- [ ] Update `replit.md` dengan overview project

---

## 📋 PHASE 1 — Struktur Monorepo

### 1.1 Root Setup
- [ ] `pnpm-workspace.yaml` — tambahkan `lib/shared`, `lib/ui`, `lib/api-client` ke workspace
- [ ] Root `package.json` — tambahkan scripts: `db:generate`, `db:migrate`, `db:seed`
- [ ] `.env.example` — dokumentasi env variables
- [ ] `.gitignore` — pastikan `.env`, `dist/`, `node_modules/` masuk

### 1.2 Package: `lib/shared`
- [ ] Buat `lib/shared/package.json` (`@workspace/shared`)
- [ ] Buat `lib/shared/tsconfig.json` (composite, declarationMap)
- [ ] Shared types:
  - [ ] `Storefront`
  - [ ] `Product`, `ProductImage`
  - [ ] `ShippingMethod`
  - [ ] `CheckoutRequest`, `CheckoutResponse`
  - [ ] `Order`, `OrderItem`
  - [ ] `OrderStatus`, `PaymentStatus`
  - [ ] `PaymentInstruction`
- [ ] Constants:
  - [ ] `ORDER_STATUS`
  - [ ] `PAYMENT_STATUS`
  - [ ] `PAYMENT_METHOD`
  - [ ] `CURRENCY`
- [ ] Zod schemas:
  - [ ] `checkoutRequestSchema`
  - [ ] `paymentConfirmationSchema`
- [ ] Money utility: `formatIDR(amount: number): string`
  - [ ] Output: `Rp 150.000` (tanpa desimal)
- [ ] Tambah ke root `tsconfig.json` references

### 1.3 Package: `lib/ui`
- [ ] Buat `lib/ui/package.json` (`@workspace/ui`)
- [ ] Setup Tailwind CSS (shared config)
- [ ] Components:
  - [ ] `Button` (variant: default, outline, ghost; size: sm, md, lg)
  - [ ] `Input` (dengan label support, error state)
  - [ ] `Textarea`
  - [ ] `Select`
  - [ ] `Card` (CardHeader, CardBody, CardFooter)
  - [ ] `Badge` (discount badge)
  - [ ] `Drawer` (cart drawer)
  - [ ] `Dialog` / `Sheet`
  - [ ] `QuantityStepper` (decrease, value, increase)
  - [ ] `Price` (format IDR, compare-at price, savings)
  - [ ] `EmptyState`
  - [ ] `LoadingState` / `Skeleton`
  - [ ] `Section` wrapper
  - [ ] `Container` wrapper
- [ ] Accessibility: focus state, label, disabled, aria-label

### 1.4 Package: `lib/api-client`
- [ ] Buat `lib/api-client/package.json` (`@workspace/api-client`)
- [ ] Base URL dari env `VITE_API_URL` (React) / `NEXT_PUBLIC_API_URL`
- [ ] Functions:
  - [ ] `getStorefront()`
  - [ ] `getProducts(params?)`
  - [ ] `getProductBySlug(slug)`
  - [ ] `getShippingMethods()`
  - [ ] `createCheckout(payload)`
  - [ ] `getOrderByCode(orderCode)`
  - [ ] `submitPaymentConfirmation(orderCode, payload)`
- [ ] Error handling konsisten sesuai API response format
- [ ] Return typed dari `@workspace/shared`

### 1.5 Artifact: `artifacts/shop` (React+Vite)
- [ ] `createArtifact` type `react-vite`, slug `shop`, previewPath `/`
- [ ] Install dependencies: `react-router-dom`, `zustand`, `@workspace/shared`, `@workspace/ui`, `@workspace/api-client`
- [ ] Setup react-router-dom dengan routes:
  - [ ] `/` — Home / Product Listing
  - [ ] `/products/:slug` — Product Detail
  - [ ] `/checkout` — Checkout
  - [ ] `/orders/:orderCode` — Order Confirmation

### 1.6 Artifact: `artifacts/management` (React+Vite placeholder)
- [ ] `createArtifact` type `react-vite`, slug `management`, previewPath `/management/`
- [ ] Placeholder page: "Management app coming soon"
- [ ] Gunakan komponen dari `@workspace/ui`
- [ ] Jangan implement auth, CRUD, dashboard

---

## 📋 PHASE 2 — OpenAPI Spec & Codegen

- [ ] Update `lib/api-spec/openapi.yaml` dengan semua endpoints:
  - [ ] `GET /storefront`
  - [ ] `GET /products`
  - [ ] `GET /products/{slug}`
  - [ ] `GET /shipping-methods`
  - [ ] `POST /checkout`
  - [ ] `GET /orders/{orderCode}`
  - [ ] `POST /orders/{orderCode}/payment-confirmation`
- [ ] Define semua response schemas di OpenAPI:
  - [ ] StorefrontResponse
  - [ ] ProductListResponse
  - [ ] ProductDetailResponse
  - [ ] ShippingMethodListResponse
  - [ ] CheckoutResponse
  - [ ] OrderResponse
  - [ ] PaymentConfirmationResponse
- [ ] Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- [ ] Verifikasi generated hooks tersedia di `lib/api-client-react/src/generated/`

---

## 📋 PHASE 3 — Design Frontend (Shop)

### 3.1 Layout & Shell
- [ ] `StorefrontProvider` — fetch & provide store settings
- [ ] `AnnouncementBar` — dari backend store setting
- [ ] `Header` — logo/nama toko + cart icon + cart count badge
- [ ] `Footer` — simple, informasi toko
- [ ] Cart count update reactive

### 3.2 Zustand Cart Store
- [ ] `CartItem` type: productId, slug, name, imageUrl, unitPrice, compareAtPrice, quantity
- [ ] Actions: addItem, removeItem, increaseQty, decreaseQty, setQty, clearCart
- [ ] Selectors: getSubtotal, getSavings, getItemCount
- [ ] Persist ke localStorage
- [ ] Cart frontend = estimasi saja (bukan source of truth harga)

### 3.3 Home / Product Listing (`/`)
- [ ] Fetch products dari backend
- [ ] Product grid: mobile 1-2 col, tablet 3 col, desktop 4 col
- [ ] Sort: newest, price asc, price desc
- [ ] `ProductCard`:
  - [ ] image
  - [ ] name
  - [ ] price (formatIDR)
  - [ ] compare-at price (strikethrough jika ada)
  - [ ] discount badge jika compare_at_price > price
  - [ ] Add to cart button
  - [ ] Loading skeleton state
- [ ] Empty state (no products)
- [ ] Loading state

### 3.4 Product Detail (`/products/:slug`)
- [ ] Fetch product by slug
- [ ] Image gallery (main image + thumbnails)
- [ ] Product name
- [ ] Price + compare-at price + discount badge
- [ ] Short description
- [ ] Quantity selector
- [ ] Add to cart button
- [ ] Buy now button (add + redirect ke checkout)
- [ ] Product description section
- [ ] FAQ accordion (dari seed backend atau static)
- [ ] Sticky bottom CTA di mobile
- [ ] Not found state (product 404)
- [ ] Stock 0 → disabled add to cart
- [ ] Desktop: image left, detail right layout

### 3.5 Cart Drawer
- [ ] Slide dari kanan (desktop max 420-480px, mobile near-full)
- [ ] Overlay backdrop halus
- [ ] Close button + overlay click close
- [ ] Item list:
  - [ ] Image thumbnail
  - [ ] Product name
  - [ ] Unit price
  - [ ] Quantity stepper
  - [ ] Remove button (aria-label)
- [ ] Subtotal estimate
- [ ] Savings estimate (jika compare price ada)
- [ ] Checkout button → navigate `/checkout`
- [ ] Empty cart state
- [ ] Trust/payment info visual sederhana (icon payment methods)

### 3.6 Checkout (`/checkout`)
- [ ] Order summary (item list, subtotal, shipping, discount, total)
- [ ] Contact form: email, phone
- [ ] Delivery address: firstName, lastName, addressLine1, addressLine2, city, province, postalCode, country (default Indonesia)
- [ ] Shipping method: fetch dari backend, radio select
- [ ] Payment method: Manual QRIS only dengan disclaimer demo
- [ ] Discount code: input + apply button (min support `HEMAT10`)
- [ ] Complete Purchase button
- [ ] Validation errors per field
- [ ] API error handling
- [ ] Disable submit saat loading
- [ ] Disable submit jika cart kosong
- [ ] Redirect ke `/orders/:orderCode` setelah sukses
- [ ] Clear cart setelah sukses
- [ ] Mobile: single column; Desktop: 2 kolom (form + summary)

### 3.7 Order Confirmation (`/orders/:orderCode`)
- [ ] Fetch order by orderCode
- [ ] Order code display
- [ ] Order status + payment status
- [ ] Item list (dari snapshot backend)
- [ ] Subtotal, discount, shipping, total
- [ ] Shipping address display
- [ ] Payment instruction (Fake QRIS):
  - [ ] QR payload block (text/visual sederhana)
  - [ ] Disclaimer: "Ini adalah QRIS demo untuk MVP, tidak memproses pembayaran real"
  - [ ] Payment expiry
- [ ] Status timeline: pending_payment → paid → processing → shipped → completed
- [ ] Payment confirmation form: payerName, reference (optional), note (optional)
- [ ] Submit confirmation → backend update status `reviewing`

---

## 📋 PHASE 4 — Database Schema

### 4.1 Drizzle Schema (`lib/db/src/schema/`)
- [ ] `stores` table
- [ ] `products` table
- [ ] `product_images` table
- [ ] `shipping_methods` table
- [ ] `discounts` table
- [ ] `orders` table
- [ ] `order_items` table (snapshot columns)
- [ ] `order_addresses` table
- [ ] `payments` table
- [ ] `payment_confirmations` table

### 4.2 Migrations
- [ ] Run `pnpm --filter @workspace/db run push` (dev)
- [ ] Verifikasi semua tabel terbuat

### 4.3 Seed Data
- [ ] Store: `RukoLite` (slug: `rukolite`, primary_color: `#0F766E` teal profesional)
- [ ] Products (4 produk demo):
  - [ ] Kopi Susu Botol (active, stock, price, compare_at_price)
  - [ ] Sambal Rumahan (active, stock, price)
  - [ ] Kaos Basic UMKM (active, stock, price, compare_at_price)
  - [ ] Paket Hampers Mini (active, stock, price)
- [ ] Shipping methods: Standard (Rp 15.000), Express (Rp 30.000)
- [ ] Discount: `HEMAT10` (percentage 10%, active)

---

## 📋 PHASE 5 — Backend Modules (Express Clean Architecture)

### 5.1 Database Connection & Infrastructure
- [ ] `lib/db` — reuse existing, update schema
- [ ] Connection pool singleton
- [ ] Repository pattern base

### 5.2 Module: Store
```
artifacts/api-server/src/modules/store/
├─ domain/store.entity.ts
├─ application/get-storefront.use-case.ts
├─ application/ports/store-repository.port.ts
├─ infrastructure/drizzle-store.repository.ts
├─ presentation/store.routes.ts
└─ store.module.ts
```
- [ ] `GET /api/storefront` endpoint
- [ ] Return: id, name, slug, logo, primaryColor, announcement, currency, country, contactEmail, contactPhone, activePaymentMethods, activeShippingMethods

### 5.3 Module: Catalog
```
artifacts/api-server/src/modules/catalog/
├─ domain/product.entity.ts
├─ domain/product.errors.ts
├─ application/get-products.use-case.ts
├─ application/get-product-by-slug.use-case.ts
├─ application/ports/catalog-repository.port.ts
├─ infrastructure/drizzle-catalog.repository.ts
├─ infrastructure/catalog.mapper.ts
├─ presentation/catalog.routes.ts
└─ catalog.module.ts
```
- [ ] `GET /api/products` — list active products, sort query
- [ ] `GET /api/products/:slug` — product detail, 404 jika inactive/tidak ada
- [ ] Jangan tampilkan produk inactive

### 5.4 Module: Shipping
```
artifacts/api-server/src/modules/shipping/
├─ domain/shipping-method.entity.ts
├─ application/get-shipping-methods.use-case.ts
├─ application/ports/shipping-repository.port.ts
├─ infrastructure/drizzle-shipping.repository.ts
├─ presentation/shipping.routes.ts
└─ shipping.module.ts
```
- [ ] `GET /api/shipping-methods` — active only

### 5.5 Module: Payment
```
artifacts/api-server/src/modules/payment/
├─ domain/payment.entity.ts
├─ domain/payment-status.ts
├─ application/create-payment-instruction.use-case.ts
├─ application/ports/payment-service.port.ts
├─ infrastructure/fake-qris.payment-service.ts
└─ payment.module.ts
```
- [ ] Fake QRIS instruction generator
- [ ] Payment status enum: pending, reviewing, paid, failed, expired, cancelled
- [ ] Disclaimer jelas: bukan real payment

### 5.6 Module: Checkout
```
artifacts/api-server/src/modules/checkout/
├─ domain/checkout.errors.ts
├─ application/create-checkout.use-case.ts
├─ application/ports/
│  ├─ catalog-repository.port.ts
│  ├─ shipping-repository.port.ts
│  ├─ discount-repository.port.ts
│  └─ order-repository.port.ts
├─ presentation/checkout.routes.ts
└─ checkout.module.ts
```
- [ ] `POST /api/checkout`
- [ ] Validate request (Zod)
- [ ] Validate product exists & active
- [ ] Validate stock >= quantity
- [ ] Validate shipping method
- [ ] Validate payment method = `manual_fake_qris`
- [ ] Validate discount code (jika ada)
- [ ] **Recalculate subtotal dari database** (jangan percaya frontend)
- [ ] **Recalculate shipping dari database**
- [ ] **Recalculate discount dari database**
- [ ] **Calculate total = subtotal + shipping - discount**
- [ ] Create order + order items snapshot
- [ ] Create order address
- [ ] Create payment record + fake QRIS instruction
- [ ] Return order code + payment instruction

### 5.7 Module: Order
```
artifacts/api-server/src/modules/order/
├─ domain/order.entity.ts
├─ domain/order-status.ts
├─ domain/order.errors.ts
├─ application/get-order-by-code.use-case.ts
├─ application/confirm-payment.use-case.ts
├─ application/ports/order-repository.port.ts
├─ infrastructure/drizzle-order.repository.ts
├─ infrastructure/order.mapper.ts
├─ presentation/order.routes.ts
├─ presentation/order.controller.ts
└─ order.module.ts
```
- [ ] `GET /api/orders/:orderCode`
- [ ] `POST /api/orders/:orderCode/payment-confirmation`
- [ ] Order status awal: `pending_payment`
- [ ] Payment confirmation → set payment status `reviewing`
- [ ] Tidak ada auto-paid

### 5.8 API Response Format
- [ ] Success: `{ "data": {} }`
- [ ] Error: `{ "error": { "code": "", "message": "", "details": [] } }`
- [ ] Error codes: VALIDATION_ERROR, NOT_FOUND, PRODUCT_NOT_AVAILABLE, INSUFFICIENT_STOCK, INVALID_SHIPPING_METHOD, INVALID_PAYMENT_METHOD, INVALID_DISCOUNT_CODE, INTERNAL_SERVER_ERROR

---

## 📋 PHASE 6 — Integrasi & Testing

- [ ] Frontend → Backend connection test (CORS, base URL)
- [ ] Product listing real data dari backend
- [ ] Product detail real data dari backend
- [ ] Cart → Checkout flow end-to-end
- [ ] Order confirmation page tampil data real
- [ ] Discount code `HEMAT10` bekerja
- [ ] Payment confirmation form bekerja
- [ ] Management placeholder accessible

---

## 📋 PHASE 7 — Quality & Acceptance

### Code Quality
- [ ] TypeScript strict (no `any`, no `@ts-ignore`)
- [ ] No business logic di React component
- [ ] No database query di HTTP controller
- [ ] No backend infrastructure import di frontend
- [ ] Tidak ada hardcoded price di frontend sebagai source of truth
- [ ] `formatIDR` hanya 1 tempat (`@workspace/shared`)
- [ ] `pnpm typecheck` pass

### Responsive
- [ ] 360px mobile ✓
- [ ] 390px mobile ✓
- [ ] 768px tablet ✓
- [ ] Desktop ✓
- [ ] Cart drawer: mobile near-full, desktop max-w 420px
- [ ] Checkout: mobile single col, desktop 2 col
- [ ] Product detail: mobile stacked, desktop 2 col

### Accessibility & UX
- [ ] Semua input punya label
- [ ] Button punya focus state
- [ ] Icon button punya aria-label
- [ ] Loading state saat fetch
- [ ] Empty cart state
- [ ] Product not found state
- [ ] Toast feedback setelah add to cart
- [ ] Form validation error visible
- [ ] Disable checkout jika cart kosong
- [ ] Keyboard focus tidak rusak

### Acceptance Criteria (dari dokumen)
- [ ] Backend starts successfully
- [ ] Shop frontend starts successfully
- [ ] Management placeholder starts successfully
- [ ] Product listing loads dari backend
- [ ] Product detail loads dari backend
- [ ] Cart drawer bekerja
- [ ] Cart persists setelah refresh
- [ ] Quantity update bekerja
- [ ] Remove cart item bekerja
- [ ] Checkout creates order via backend
- [ ] Backend recalculates total (bukan dari frontend)
- [ ] Order confirmation page tampil order data
- [ ] Fake QRIS instruction muncul
- [ ] Shipping method dari backend, user bisa pilih
- [ ] Discount `HEMAT10` bekerja
- [ ] Payment confirmation endpoint bekerja, status → `reviewing`
- [ ] UI responsive mobile-first
- [ ] UI tidak meniru design screenshot
- [ ] Management app sebagai placeholder reuse UI package

---

## 🚫 Tidak Diimplementasi (MVP Scope)

Sesuai dokumen, sengaja tidak dibuat:
- Real payment gateway (Midtrans, Xendit, Duitku, Tripay)
- Shipping integration (RajaOngkir, Biteship)
- Login / Auth admin
- Admin CRUD (product, order management)
- Upload image management
- Multi-store / marketplace
- Subscription / loyalty
- Advanced analytics
- Email / WhatsApp notification
- Invoice PDF
- Abandoned cart
- Theme builder / CMS

---

## 📊 Final Report Format

Setelah selesai, laporan akan berisi:
1. Summary apa yang dibangun
2. Folder structure yang dibuat
3. Commands untuk menjalankan
4. Environment variables yang dibutuhkan
5. API endpoints yang diimplementasi
6. Database tables yang dibuat
7. Seed data yang dibuat
8. Frontend pages yang diimplementasi
9. Management placeholder status
10. Yang sengaja tidak diimplementasi
11. Known limitations / Replit-specific notes
12. Konfirmasi screenshot hanya dipakai sebagai UX reference, bukan dikopi

---

## ⚡ Progress

| Phase | Status |
|---|---|
| Phase 0 — ROADMAP | ✅ Done |
| Phase 1 — Struktur | 🔄 In Progress |
| Phase 2 — OpenAPI & Codegen | ⏳ Pending |
| Phase 3 — Design Frontend | ⏳ Pending |
| Phase 4 — Database Schema | ⏳ Pending |
| Phase 5 — Backend Modules | ⏳ Pending |
| Phase 6 — Integrasi | ⏳ Pending |
| Phase 7 — Quality & Acceptance | ⏳ Pending |
