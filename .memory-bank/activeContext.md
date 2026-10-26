# Active Context: Inbisco MitraHub

## 1. Current Focus
Seluruh arsitektur backend REST API **Inbisco MitraHub** telah selesai dibangun di root repository (`/run/media/wisesa/DATA2/MitraHubInbisco`), terhubung dengan Supabase PostgreSQL (Transaction Pooler `:6543` & Direct Session Pooler `:5432`) serta Upstash Redis HTTP REST cache, lengkap dengan data seeder produk Mayora & mitra warung Sidoarjo dan verifikasi End-to-End (E2E).

## 2. What Was Accomplished
- **Inisialisasi Memory Bank & Supabase Agent Skills:**
  - Membuat 6 dokumen `.memory-bank/`.
  - Menginstal `supabase/agent-skills` (`supabase` & `supabase-postgres-best-practices`).
- **Database & ORM Setup (`prisma/schema.prisma`, `prisma/seed.js`):**
  - Konfigurasi Prisma 6 + NixOS local engine bindings di `.env` dan `.env.local` (serta kompatibel penuh dengan Vercel Serverless Linux).
  - Sinkronisasi skema (`Store`, `Product`, `Order`, `OrderItem`, enum `OrderStatus`, `PaymentMethod`) ke Supabase PostgreSQL.
  - Seeding 6 toko mitra di kecamatan Sidoarjo, 8 produk Mayora dengan variasi batch FEFO (`DANGER` < 3 bulan, `WARNING` < 6 bulan, `SAFE` >= 6 bulan), dan 3 sample pesanan grosir (`INB-2610-KR01`, `INB-2610-TM02`, `INB-2610-WR03`).
- **Clean Layered Architecture (`src/` & `api/index.js`):**
  - `src/config/database.js` & `src/config/redis.js`: Singleton Prisma Client & fail-open Upstash Redis cache wrapper (`cache:catalog_public` TTL 3600s, `cache:kpi_summary` TTL 180s).
  - `src/middlewares/*`: Constant-time Bearer token auth (`crypto.timingSafeEqual`), Zod validation middleware, dan centralized error handler.
  - `src/modules/products/*`: Katalog publik dengan Redis caching & kalkulasi estimasi margin.
  - `src/modules/stores/*`: Registrasi warung mitra dengan normalisasi nomor HP Indonesia & validasi 18 kecamatan di Kabupaten Sidoarjo.
  - `src/modules/orders/*`: Atomic checkout (`prisma.$transaction`) dengan conditional atomic stock decrement (`stockCartons: { gte: quantity }`), generator kode resi `INB-YYMM-XXXX`, dan live order tracking.
  - `src/modules/admin/*`: Ringkasan 4 KPI + Fast Moving Products, filter order per status & kecamatan, *Strict One-Way State Machine* (dengan auto-restock saat `CANCELLED`), FEFO warehouse inventory alert, verifikasi mitra toko, serta penambahan/update stok produk (`POST /api/v1/admin/products` & `PATCH /api/v1/admin/products/:id/stock`).

## 3. Immediate Next Steps
1. Integrasi endpoint API dengan tim Frontend (Raka - Next.js + Tailwind).
2. Deploy repository ke Vercel dan masukkan environment variables dari `.env.example` ke dashboard Vercel.
3. Opsional: Tambahkan unit test / dokumentasi OpenAPI (Swagger) jika dibutuhkan untuk penilaian penjurian GTNIC 2026.

