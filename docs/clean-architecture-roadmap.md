# Roadmap: Clean Architecture — API Server

Branch: `clean-architecture`  
Tanggal dibuat: 2026-07-04  

---

## Latar Belakang

Backend saat ini (`artifacts/api-server`) tidak memiliki separation of concerns. Semua logika — validasi input, business rules, query database, dan formatting response — tercampur di dalam satu file route handler. Ini melanggar prinsip Single Responsibility dan membuat kode sulit dibaca, diuji, dan dikembangkan.

### Masalah konkret yang ada sekarang

| Masalah | Contoh |
|---|---|
| Validasi input di route handler | `if (!items?.length \|\| !customer?.email ...)` di `checkout.ts` |
| Query DB langsung di route handler | `await db.select().from(...)` tersebar di semua route |
| Helper function duplikat | `generateId()`, `getActiveStoreId()`, `apiError()` muncul di setiap file |
| Tidak ada error class terpusat | Setiap handler punya format error sendiri-sendiri |
| Tidak ada async error propagation | Setiap handler harus `try/catch` manual atau crash silently |
| Business logic tidak bisa diuji tanpa HTTP | Tidak ada unit test karena logic terikat ke `req`/`res` |

---

## Target Arsitektur

```
artifacts/api-server/src/
│
├── routes/                  ← Tipis: daftarkan path, panggil controller
│   ├── index.ts
│   ├── health.ts
│   ├── catalog.ts
│   ├── store.ts
│   ├── shipping.ts
│   ├── checkout.ts
│   ├── orders.ts
│   └── admin/
│       ├── products.ts
│       ├── orders.ts
│       └── settings.ts
│
├── controllers/             ← HTTP layer: ekstrak input → panggil service → kirim response
│   ├── catalog.controller.ts
│   ├── store.controller.ts
│   ├── shipping.controller.ts
│   ├── checkout.controller.ts
│   ├── orders.controller.ts
│   └── admin/
│       ├── products.controller.ts
│       ├── orders.controller.ts
│       └── settings.controller.ts
│
├── services/                ← Business logic: tidak tahu HTTP, tidak tahu framework
│   ├── catalog.service.ts
│   ├── store.service.ts
│   ├── shipping.service.ts
│   ├── checkout.service.ts
│   ├── orders.service.ts
│   └── admin/
│       ├── products.service.ts
│       ├── orders.service.ts
│       └── settings.service.ts
│
├── middlewares/
│   ├── error-handler.ts     ← Centralized Express error handler
│   └── async-handler.ts     ← Wrap async controller agar error diteruskan ke next()
│
└── lib/
    ├── errors.ts            ← AppError class (code, message, httpStatus)
    └── logger.ts            ← (sudah ada, tidak berubah)
```

---

## Prinsip yang Diikuti

### 1. Route = Peta jalan, bukan tempat kerja

```ts
// ✅ BENAR — route hanya mendaftarkan path
router.post('/checkout', asyncHandler(checkoutController.create));

// ❌ SALAH — route mengerjakan validasi dan query
router.post('/checkout', async (req, res) => {
  if (!req.body.items?.length) { ... }
  const store = await db.select()...
});
```

### 2. Controller = Penerjemah HTTP

Controller hanya bertanggung jawab untuk:
- Mengekstrak data dari `req` (body, params, query)
- Memanggil service yang sesuai
- Memformat dan mengirim `res`
- **Tidak boleh** berisi query DB atau business rule

```ts
// ✅ BENAR
export const create = async (req: Request, res: Response) => {
  const result = await checkoutService.createOrder(req.body);
  res.status(201).json({ data: result });
};
```

### 3. Service = Otak aplikasi

Service bertanggung jawab untuk:
- Semua business logic dan validasi domain
- Mengakses database
- Melempar `AppError` bila ada kondisi error
- **Tidak boleh** menyentuh `req`, `res`, atau `next`

```ts
// ✅ BENAR
export async function createOrder(input: CheckoutInput) {
  const store = await getActiveStore();
  if (!store) throw new AppError('STORE_NOT_FOUND', 'Toko tidak ditemukan', 404);
  // ... business logic
  return { orderCode, payment };
}
```

### 4. AppError = Satu bahasa untuk semua error

```ts
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number = 400,
  ) {
    super(message);
  }
}
```

Error handler di Express menangkap semua `AppError` dan mengembalikan response JSON yang konsisten:

```json
{ "error": { "code": "PRODUCT_NOT_FOUND", "message": "Produk tidak ditemukan" } }
```

### 5. asyncHandler = Tidak ada try/catch manual

```ts
// middlewares/async-handler.ts
export const asyncHandler = (fn: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

---

## Fase Pelaksanaan

### Fase 1 — Infrastruktur (fondasi)

**File yang dibuat:**
- `lib/errors.ts` — `AppError` class
- `middlewares/async-handler.ts` — wrapper async route
- `middlewares/error-handler.ts` — centralized error handler
- Update `app.ts` — pasang error handler sebagai middleware terakhir

**Tidak ada perubahan perilaku API.** Hanya pondasi yang dipasang.

---

### Fase 2 — Services (ekstrak business logic)

Untuk setiap domain, pindahkan semua logic dari route handler ke service:

| Service | Tanggung Jawab |
|---|---|
| `store.service.ts` | Ambil data toko aktif, update settings |
| `catalog.service.ts` | List produk, ambil produk by slug |
| `shipping.service.ts` | List metode pengiriman |
| `checkout.service.ts` | Validasi cart, hitung harga, buat order, buat payment |
| `orders.service.ts` | Ambil order by kode, konfirmasi pembayaran |
| `admin/products.service.ts` | CRUD produk + gambar |
| `admin/orders.service.ts` | List orders, detail, update status |
| `admin/settings.service.ts` | Baca & simpan pengaturan toko |

**Helper bersama yang dipindah ke service layer:**
- `generateId()` → `lib/utils.ts`
- `generateOrderCode()` → `lib/utils.ts`
- `getActiveStore()` → `store.service.ts` (satu sumber kebenaran)
- `serializeOrderDetail()` → `admin/orders.service.ts`
- `serializeProduct()` → `admin/products.service.ts`

---

### Fase 3 — Controllers (tipis, hanya HTTP)

Setiap controller memanggil service dan memformat response:

| Controller | Method yang di-export |
|---|---|
| `catalog.controller.ts` | `list`, `getBySlug` |
| `store.controller.ts` | `getStorefront` |
| `shipping.controller.ts` | `list` |
| `checkout.controller.ts` | `create` |
| `orders.controller.ts` | `getByCode`, `confirmPayment` |
| `admin/products.controller.ts` | `list`, `get`, `create`, `update`, `delete` |
| `admin/orders.controller.ts` | `list`, `get`, `updateStatus` |
| `admin/settings.controller.ts` | `get`, `update` |

---

### Fase 4 — Routes (dibersihkan)

Route hanya menjadi daftar mapping path → controller:

```ts
// routes/catalog.ts — contoh akhir
import { Router } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import * as catalogController from '../controllers/catalog.controller';

const router = Router();

router.get('/products', asyncHandler(catalogController.list));
router.get('/products/:slug', asyncHandler(catalogController.getBySlug));

export default router;
```

---

### Fase 5 — Cleanup & Verifikasi

- [ ] Hapus semua duplikasi helper function di route lama
- [ ] Pastikan tidak ada `import { db }` langsung di route atau controller
- [ ] Smoke test semua endpoint via curl
- [ ] Verifikasi semua alur di management dashboard dan storefront masih jalan

---

## Apa yang TIDAK berubah

- Semua URL endpoint tetap sama (tidak ada breaking change ke frontend)
- Schema database tidak berubah
- `lib/db`, `lib/api-spec`, `lib/api-client-react` tidak disentuh
- Behavior/response format API identik

---

## Ukuran Pekerjaan

| Item | Jumlah |
|---|---|
| File infrastruktur baru | 3 |
| Service files | 8 |
| Controller files | 8 |
| Route files yang ditulis ulang | 10 |
| File dihapus/digabung | 0 (lama diganti) |
| **Total file baru/diubah** | **~29** |

---

## Definisi Selesai

Refactor dinyatakan selesai jika:
1. Tidak ada query `db.*` di file `routes/` atau `controllers/`
2. Tidak ada `req`/`res` di file `services/`
3. Semua async route handler dibungkus `asyncHandler`
4. Semua error dilempar sebagai `AppError` dari service
5. Satu error handler di `app.ts` yang menangani semua error
6. Seluruh endpoint lama masih merespons dengan payload yang sama
