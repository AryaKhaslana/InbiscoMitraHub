# Active Context: Inbisco MitraHub

## 1. Current Focus
Seluruh temuan dari **Security Audit Putaran 1 s/d Putaran 5** telah selesai diperbaiki dan diverifikasi langsung ke Supabase PostgreSQL & Upstash Redis.

## 2. Security & Hardening Changes Applied (Round 1 + Round 2 + Round 3)
1. **Supabase RLS + `ALTER DEFAULT PRIVILEGES` (`prisma/security_rls.sql`):**
   - Mengaktifkan RLS dan `REVOKE ALL` pada 4 tabel utama (`Store`, `Product`, `Order`, `OrderItem`).
   - Menjalankan `ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL` oleh `postgres` agar tabel baru di masa depan otomatis tertutup dari `anon` dan `authenticated`.
2. **CSPRNG `ADMIN_SECRET_KEY` & SHA-256 Constant-Time Auth (`src/middlewares/auth.middleware.js`):**
   - Men-generate `ADMIN_SECRET_KEY` baru langsung ke `.env` dan `.env.local` via `crypto.randomBytes(32)` tanpa mencetaknya ke chat.
   - Menggunakan SHA-256 digest sebelum `crypto.timingSafeEqual` agar panjang token tidak bocor.
3. **Anti-Spoofing Rate Limiter di Semua Route Publik & Admin (`src/middlewares/rateLimit.middleware.js`, `src/modules/admin/admin.routes.js`):**
   - Menutup celah bypass via `X-Forwarded-For` palsu dan menggunakan sliding TTL per IP.
   - Dipasang di seluruh endpoint publik (`products`, `stores/register`, `orders`, `orders/track`) serta di atas seluruh endpoint `/api/v1/admin/*` sebelum `adminAuth`.
4. **Eliminasi HPP & Cache Bypass pada Katalog Produk (`src/modules/products/*`):**
   - Memasang validasi Zod `productsQuerySchema` untuk memblokir serangan HTTP Parameter Pollution (`?search[]=a&search[]=b` -> `400 Bad Request`).
   - Melakukan filter `?search=` dan `?category=` secara *in-memory* di atas data katalog yang sudah di-cache di Redis (`cache:catalog_public`), sehingga 100% request tetap `X-Cache: HIT` tanpa membebani PostgreSQL.
5. **Anti-Enumeration & Anti-Cache-Busting pada Registrasi Toko (`src/modules/stores/stores.service.js`):**
   - Menghilangkan nama toko dari pesan error `409 Conflict` saat nomor HP duplikat didaftarkan.
   - Tidak meng-invalidasi `cache:kpi_summary` saat pendaftaran toko publik yang belum terverifikasi (`isVerified: false`).
6. **Proteksi Checkout, FEFO Expiry Guard, & Redaksi Tracking (`src/modules/orders/*`):**
   - Menolak checkout dari toko yang belum diverifikasi (`403 Forbidden`).
   - Menolak checkout produk yang sudah melewati `expiryDate` (`400 Bad Request`) dan menyembunyikan produk kedaluwarsa dari katalog publik.
   - Menghapus `store.id` dan `order.storeId` dari response `GET /api/v1/orders/track/:code`, menyamarkan nomor HP (`maskedPhone`), serta memperpanjang kode resi menjadi 8 karakter acak (`INB-YYMM-XXXXXXXX`).
7. **Admin & Concurrency Hardening (`src/modules/admin/*`, `src/middlewares/rateLimit.middleware.js`, `prisma/schema.prisma`):**
   - Compare-And-Swap (CAS) pada `updateOrderStatus` mencegah *double-restock* saat 2 request `CANCELLED` masuk bersamaan.
   - `PATCH /api/v1/admin/products/:id/stock` menggunakan atomic `{ increment: addCartons }` + conditional `stockCartons: { gte }` (bebas *lost update* saat paralel dengan checkout warung).
   - Rate limiter memakai `redis.pipeline()` (`INCR` + `EXPIRE ... NX` dalam 1 HTTP request) sehingga mustahil meninggalkan *zombie key* (`TTL -1`), dan `DISABLE_RATE_LIMIT` dikunci hanya untuk non-production.
   - 3 Foreign Key Indexes (`Order_storeId_idx`, `OrderItem_orderId_idx`, `OrderItem_productId_idx`) sudah terpasang di Supabase PostgreSQL.
   - `PATCH /api/v1/admin/stores/:id/verify` mewajibkan boolean eksplisit `{ "isVerified": true | false }`.
   - `POST /api/v1/admin/products` memvalidasi `imageUrl` agar wajib berprotokol `http://` atau `https://` (menolak `javascript:` / `data:` XSS).
   - `GET /api/v1/admin/stores` kini dilengkapi paginasi (`page`, `limit`, `meta`).
8. **Round 5 Schema & Boundary Hardening (`api/index.js`, `src/modules/orders/*`, `src/modules/admin/admin.schema.js`, `src/modules/stores/stores.schema.js`):**
   - Menutup bypass batas 1000 karton via item duplikat setelah `mergeDuplicateOrderItems()`.
   - Mengaktifkan `.strict()` di seluruh Zod body schema untuk memblokir *mass-assignment* / field tak dikenal.
   - Menolak pengiriman `stockCartons` dan `addCartons` secara bersamaan (`400 Bad Request`).
   - Membatasi `page <= 10000` (anti *deep-OFFSET DoS*), harga `<= 999_999_999` (anti `Decimal(12,2)` overflow), dan ukuran body JSON/form ke `100kb`.
   - Menghapus kebocoran `process.uptime()` & `NODE_ENV` pada `/api/v1/health` serta memasang rate limit `120 req/m`.

## 3. Immediate Next Steps
1. Lakukan rotasi password DB Supabase & token Upstash Redis dari dashboard masing-masing sebelum rilis produksi.
2. Sesuaikan `CORS_ORIGIN` di Vercel dengan URL frontend Next.js milik Raka.
