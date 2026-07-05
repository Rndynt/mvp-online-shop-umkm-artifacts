# RukoLite — Online Shop UMKM MVP

RukoLite adalah platform toko online untuk UMKM (Usaha Mikro, Kecil, dan Menengah) di Indonesia. Proyek ini dibangun sebagai **pnpm monorepo**. Toko demo yang dipakai: **Kopio** — toko kopi spesialti dengan 12 produk (biji kopi, kopi giling, dll).

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
- Upload foto produk & logo toko langsung ke cloud storage (drag & drop)
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
  object-storage-web/    Helper upload gambar (presigned URL ke Google Cloud Storage)
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
                  PostgreSQL (database)
```

Semua respons API dibungkus dalam format `{ data: ... }`. Frontend (storefront & management) tidak pernah bicara langsung ke database — semuanya lewat API Server, supaya validasi & keamanan terjaga di satu tempat.

Upload gambar (foto produk, logo toko) memakai alur **presigned URL**: frontend minta izin unggah ke API Server → API Server balas URL sementara ke Google Cloud Storage → frontend unggah file langsung ke URL itu → gambar bisa langsung diakses publik lewat `/api/storage/objects/...`.

### Tech Stack

| Bagian | Teknologi |
|---|---|
| Storefront | Next.js 15 (App Router), React 19, Tailwind CSS 4, React Query |
| Management | React 19 + Vite 7, Tailwind CSS 4, React Hook Form, Radix UI |
| API Server | Express 5, TypeScript, Drizzle ORM, Zod |
| Database | PostgreSQL |
| Penyimpanan file | Google Cloud Storage (via presigned URL) |
| Package manager | pnpm (workspaces, bukan Turborepo) |
| Bahasa | TypeScript di semua bagian |

## Menjalankan Proyek

### Prasyarat
- Node.js 20+
- pnpm
- PostgreSQL (lokal atau terkelola)

### Langkah-langkah

```bash
# 1. Install semua dependency
pnpm install

# 2. Salin file environment variable & sesuaikan isinya
cp .env.example .env

# 3. Terapkan skema database
pnpm --filter @workspace/db run push

# 4. Isi data demo (toko Kopio, 12 produk, metode pengiriman, kode diskon)
pnpm --filter @workspace/db run seed

# 5. Jalankan masing-masing bagian aplikasi (bisa di terminal terpisah)
cd artifacts/api-server && PORT=8080 pnpm run dev      # API Server
pnpm --filter @workspace/shop-next run dev             # Storefront Kopio (port 5000)
cd artifacts/management && PORT=5173 pnpm run dev      # Panel Management (port 5173)
```

Setelah semuanya jalan:
- Storefront: `http://localhost:5000`
- Management: `http://localhost:5173`
- API (cek langsung): `http://localhost:8080/api/storefront`

Kode diskon demo: **NGOPI10** (potongan 10%)

## Environment Variables

Buat file `.env` di root proyek (lihat `.env.example`):

| Key | Contoh Nilai | Keterangan |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Koneksi ke database PostgreSQL |
| `SESSION_SECRET` | (rahasia, acak) | Untuk keamanan sesi |
| `PORT` | `5000` | Port default layanan |
| `CORS_ORIGIN` | domain, dipisah koma | Origin yang diizinkan mengakses API |
| `VITE_API_URL` | `/api` | Alamat dasar API untuk frontend |
| `NODE_ENV` | `development` | Mode environment |
| `PUBLIC_OBJECT_SEARCH_PATHS` | disediakan platform storage | Lokasi bucket untuk gambar publik |
| `PRIVATE_OBJECT_DIR` | disediakan platform storage | Lokasi bucket untuk staging upload |

> Untuk upload gambar (foto produk/logo), butuh bucket Google Cloud Storage — nilai `PUBLIC_OBJECT_SEARCH_PATHS` dan `PRIVATE_OBJECT_DIR` biasanya disediakan otomatis oleh platform hosting (mis. Replit Object Storage). Jika hosting sendiri, siapkan bucket GCS dan isi variabel ini secara manual.

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

> Fitur upload gambar (foto produk/logo) butuh bucket Google Cloud Storage aktif — kalau dijalankan murni lokal di Termux tanpa akses ke platform storage tersebut, fitur upload gambar tidak akan berfungsi kecuali kamu siapkan sendiri kredensial GCS dan isi `PUBLIC_OBJECT_SEARCH_PATHS` / `PRIVATE_OBJECT_DIR`.

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

## Lisensi

Proyek internal / privat — belum ditentukan lisensi publik.
