# Active Context: Inbisco MitraHub

## 1. Current Focus
Seluruh 16 endpoint REST API (7 Public + 9 Admin) dan Audit Trail Engine telah selesai, teruji otomatis, dan terdokumentasi lengkap di `README.md` serta `.memory-bank/progress.md`.

## 2. Recent Additions
- Menambahkan tabel **`AuditLog`** di Supabase PostgreSQL dengan RLS aktif (`REVOKE ALL` dari `anon`/`authenticated`) serta 3 index performa (`[entityType, entityId]`, `[createdAt]`, `[action]`).
- Menambahkan pencatatan otomatis di setiap mutasi admin:
  - `ORDER_STATUS_UPDATED` (di dalam transaksi CAS)
  - `STORE_VERIFIED` (perubahan status verifikasi mitra)
  - `PRODUCT_CREATED` (penambahan SKU baru)
  - `PRODUCT_STOCK_UPDATED` (penyesuaian stok/harga/batch)
- Mengekspos endpoint **`GET /api/v1/admin/audit-logs`** dengan paginasi dan filter `action`, `entityType`, serta `entityId`.
- Ekstraksi aman `ipAddress` client via helper `getClientIp(req)`.

## 3. Immediate Next Steps
1. Deploy pembaruan ke Vercel (`git push origin main`).
2. Sampaikan ringkasan ke user.
