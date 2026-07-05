# RukoLite — Online Shop UMKM MVP

RukoLite adalah platform toko online untuk UMKM (Usaha Mikro, Kecil, dan Menengah) di Indonesia. Proyek ini dibangun sebagai **pnpm monorepo** dan dijalankan di Replit. Toko demo yang dipakai: **Kopio** — toko kopi spesialti dengan 12 produk (biji kopi, kopi giling, dll).

Aplikasi ini terdiri dari 3 bagian yang berjalan bersamaan:
1. **Storefront (Kopio)** — halaman belanja yang dilihat pembeli
2. **Management** — panel admin untuk pemilik toko mengatur produk, pesanan, dan pengaturan toko
3. **API Server** — "otak" di belakang layar yang menghubungkan storefront & management ke database

## Fitur Utama

### Storefront (untuk pembeli)
- Halaman utama dengan beberapa pilihan **template desain** (bisa diganti dari Management)
- Daftar produk & halaman detail produk, lengkap dengan **varian** (misalnya: jenis gilingan × berat, seperti di Shopify)
- Keranjang belanja (cart drawer) yang muncul dari samping
- Checkout dengan pemilihan **metode pengiriman**
- Kode diskon (demo: **NGOPI10** = potongan 10%)
- Pembayaran **QRIS** dengan konfirmasi manual (simulasi, cocok untuk demo/MVP)
- Semua teks & mata uang dalam **Bahasa Indonesia / Rupiah (IDR)**

### Management (untuk pemilik toko)
- CRUD produk (tambah, edit, hapus produk & variannya)
- Manajemen pesanan (lihat & ubah status pesanan masuk)
- Pengaturan kode diskon
- Pengaturan metode pengiriman
- Pengaturan metode pembayaran
- Analitik penjualan sederhana
- Pilihan template tampilan storefront
- Kustomisasi identitas toko (nama toko, logo, warna tema)

## Arsitektur & Struktur Folder

```
artifacts/
  api-server/      Express 5 REST API              → port 8080  (diakses lewat /api)
  shop-next/       Next.js 15 — storefront Kopio    → port 5000  (diakses lewat /)
  management/      React + Vite — panel admin       → port 5173  (diakses lewat /management/)
  shop/            (LEGACY) versi lama storefront berbasis Vite — sudah tidak aktif/dirutekan,
                   dibiarkan tersimpan sebagai arsip, digantikan oleh shop-next
lib/
  db/                    Skema database (Drizzle ORM + PostgreSQL) & script seed data demo
  shared/                Tipe TypeScript & konstanta yang dipakai bersama semua bagian
  api-zod/               Skema validasi (Zod) untuk request/response API
  api-client/            Klien API berbasis fetch (tidak terikat framework tertentu)
  api-client-react/      Wrapper React Query di atas api-client
  api-spec/              Dokumentasi API (OpenAPI spec)
  object-storage-web/    Helper untuk penyimpanan file/gambar (Google Cloud Storage)
scripts/
  post-merge.sh          Dijalankan otomatis setelah ada perubahan besar (install deps + sync skema DB)
```

### Alur Data (Data Flow)

```
Pembeli/Admin  →  Storefront / Management (frontend)
                        │  fetch via @workspace/api-client(-react)
                        ▼
                  API Server (Express, port 8080, prefix /api)
                        │  Drizzle ORM
                        ▼
                  PostgreSQL (Replit-managed database)
```

Semua respons API dibungkus dalam format `{ data: ... }`. Frontend (storefront & management) tidak pernah bicara langsung ke database — semuanya lewat API Server, supaya validasi & keamanan terjaga di satu tempat.

### Tech Stack

| Bagian | Teknologi |
|---|---|
| Storefront | Next.js 15 (App Router), React 19, Tailwind CSS 4, React Query |
| Management | React 19 + Vite 7, Tailwind CSS 4, React Hook Form, Radix UI |
| API Server | Express 5, TypeScript, Drizzle ORM, Zod |
| Database | PostgreSQL (Replit-managed) |
| Package manager | pnpm (workspaces, bukan Turborepo) |
| Bahasa | TypeScript di semua bagian |

## Menjalankan Proyek di Replit

Tiga workflow berjalan otomatis saat proyek dibuka:
- **artifacts/api-server: API Server** — build & jalankan Express API (port 8080)
- **artifacts/shop-next: web** — Next.js dev server untuk storefront Kopio (port 5000, ini yang tampil di preview utama `/`)
- **artifacts/management: web** — Vite dev server untuk panel admin (port 5173, diakses lewat `/management/`)

> Catatan: folder `artifacts/shop` (versi lama) sengaja **tidak dijalankan/dirutekan lagi** — sudah digantikan sepenuhnya oleh `artifacts/shop-next`. Foldernya tetap disimpan sebagai arsip, bukan dihapus.

## Database

Menggunakan **PostgreSQL bawaan Replit** (`DATABASE_URL` otomatis tersedia).

```bash
# Menerapkan perubahan skema ke database
pnpm --filter @workspace/db run push

# Mengisi ulang data demo (toko Kopio, 12 produk, metode pengiriman, kode diskon)
pnpm --filter @workspace/db run seed
```

Kode diskon demo: **NGOPI10** (potongan 10%)

## Environment Variables

Diatur lewat Replit Secrets / Env Vars:

| Key | Contoh Nilai | Keterangan |
|-----|-------|-------|
| `DATABASE_URL` | otomatis | Dikelola oleh Replit |
| `SESSION_SECRET` | (rahasia, acak) | Disimpan sebagai Replit Secret |
| `PORT` | `5000` | Port API server (di Replit dipetakan ulang ke 8080) |
| `CORS_ORIGIN` | domain, dipisah koma | Origin yang diizinkan mengakses API |
| `VITE_API_URL` | `/api` | Alamat dasar API untuk frontend |
| `NODE_ENV` | `development` | Mode environment |

## Menjalankan Proyek Secara Lokal di Termux (HP Android)

Panduan ini untuk menjalankan proyek di HP Android memakai aplikasi **Termux**, setelah kamu sudah meng-clone repo dan menjalankan `pnpm install`.

### 1. Persiapan awal (sekali saja)

```bash
# Update paket Termux & pasang Node.js 20 + PostgreSQL
pkg update && pkg upgrade -y
pkg install nodejs-lts postgresql git -y

# Pasang pnpm (jika belum ada)
npm install -g pnpm
```

### 2. Siapkan database PostgreSQL lokal

```bash
# Inisialisasi database (sekali saja)
initdb $PREFIX/var/lib/postgresql

# Jalankan server PostgreSQL
pg_ctl -D $PREFIX/var/lib/postgresql start

# Buat database untuk RukoLite
createdb online_shop_umkm
```

> Setiap kali membuka ulang Termux, kamu perlu menjalankan lagi `pg_ctl -D $PREFIX/var/lib/postgresql start` sebelum menjalankan aplikasi.

### 3. Siapkan file environment variable

Buat file `.env` di folder root proyek (salin dari `.env.example`):

```bash
cp .env.example .env
```

Lalu sesuaikan isinya, minimal:

```
DATABASE_URL="postgresql://localhost:5432/online_shop_umkm"
SESSION_SECRET="ganti-dengan-teks-acak-rahasia"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
VITE_API_URL="/api"
```

### 4. Install dependencies (jika belum)

```bash
pnpm install
```

### 5. Siapkan skema & data demo

```bash
# Buat semua tabel di database
pnpm --filter @workspace/db run push

# Isi data demo (toko Kopio, produk, dll)
pnpm --filter @workspace/db run seed
```

### 6. Jalankan setiap bagian aplikasi

Buka **3 sesi Termux terpisah** (pakai fitur "New session" di Termux), lalu di masing-masing sesi jalankan salah satu perintah berikut:

```bash
# Sesi 1 — API Server (port 8080)
cd artifacts/api-server && PORT=8080 pnpm run dev

# Sesi 2 — Storefront Kopio (port 5000)
pnpm --filter @workspace/shop-next run dev

# Sesi 3 — Panel Management (port 5173)
cd artifacts/management && PORT=5173 pnpm run dev
```

### 7. Akses aplikasi

Buka browser HP kamu dan kunjungi:
- Storefront: `http://localhost:5000`
- Management: `http://localhost:5173`
- API (cek langsung): `http://localhost:8080/api/storefront`

> Tips: kalau sesi Termux tertutup/HP restart, kamu perlu mengulang langkah 2 (start PostgreSQL) dan langkah 6 (jalankan ulang ketiga server) — data yang sudah tersimpan di database tidak akan hilang.

## User Preferences

- Pertahankan struktur monorepo yang ada (`artifacts/` + `lib/`)
- Gunakan pnpm workspaces (bukan Turborepo)
- Lokal Indonesia (mata uang IDR, UI berbahasa Indonesia)
- Storefront resmi sekarang adalah `artifacts/shop-next` (Next.js); `artifacts/shop` (Vite lama) disimpan sebagai arsip tapi tidak dijalankan/dirutekan
