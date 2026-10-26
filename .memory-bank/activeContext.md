# Active Context: Inbisco MitraHub

## 1. Current Focus
Seluruh temuan Security Audit (Kritis, Tinggi, dan Bug/Hardening) telah dieksekusi dan diverifikasi secara End-to-End (E2E) pada database Supabase dan Upstash Redis.

## 2. Security & Hardening Changes Applied
1. **Supabase RLS & Role Lockout (`prisma/security_rls.sql`):**
   - `ENABLE ROW LEVEL SECURITY` telah diaktifkan pada tabel `Store`, `Product`, `Order`, dan `OrderItem`.
   - `REVOKE ALL` telah dijalankan terhadap role `anon` dan `authenticated` sehingga PostgREST Data API tertutup rapat.
2. **Secret Hygiene & Constant-Time SHA-256 Auth (`src/middlewares/auth.middleware.js`):**
   - `.env.example` telah dibersihkan dari secret asli.
   - `ADMIN_SECRET_KEY` di `.env` & `.env.local` telah diganti dengan 256-bit high-entropy token.
   - `adminAuth` kini melakukan hash `SHA-256` pada token sebelum `crypto.timingSafeEqual` agar panjang token tidak bocor via *timing side-channel*.
3. **Stateless Upstash Rate Limiting (`src/middlewares/rateLimit.middleware.js`):**
   - Proteksi IP-based rate limiter dipasang di `POST /api/v1/stores/register` (10 req/m), `POST /api/v1/orders` (15 req/m), `GET /api/v1/orders/track/:code` (30 req/m), dan `GET /api/v1/products` (60 req/m).
4. **Business Logic & PII Hardening (`src/modules/orders/*`, `src/modules/admin/*`):**
   - **Verified Store Checkout Guard:** `POST /api/v1/orders` menolak (`403 Forbidden`) toko yang belum diverifikasi (`isVerified: false`) agar bot tidak bisa membuat akun palsu dan menguras stok gudang.
   - **Public Tracking PII Redaction:** `GET /api/v1/orders/track/:code` menyembunyikan alamat detail & nama pemilik serta menyamarkan nomor telepon (`maskedPhone: 0812****0001`).
   - **Compare-And-Swap (CAS) pada `updateOrderStatus`:** Mencegah *race condition* *double-restock* ketika dua request `CANCELLED` dieksekusi bersamaan.
   - **Exact Currency Math (`Prisma.Decimal`) & Transaction Timeout:** Perhitungan harga menggunakan `Prisma.Decimal` dan timeout transaksi dinaikkan ke `15000ms` (`connection_limit=5`).
   - **Malformed JSON & Error Sanitization:** Syntax error JSON dikembalikan sebagai `400 Bad Request` dan pesan error internal 500 tidak lagi dibocorkan ke response publik.

## 3. Immediate Next Steps
1. Sebelum naik ke produksi penuh, lakukan rotasi password database Supabase dan token Upstash Redis di dashboard masing-masing karena sempat tercantum di chat.
2. Sesuaikan `CORS_ORIGIN` di Vercel dengan domain frontend Next.js milik Raka.
