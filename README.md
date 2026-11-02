# Inbisco MitraHub — Backend & Data Engine (Master Progress & API Handover)

**Production URL:** `https://inbisco-mitrahub-backend.vercel.app`  
**Proyek:** PKL PT Inbisco Niagatama Semesta & Kompetisi GTNIC 2026  
**Status:** Production-Ready & Hardened (6 Putaran Security Audit)

---

## 1. Ringkasan Arsitektur & Infrastruktur
- **Runtime & Framework:** Node.js (ES Modules) + Express.js di atas **Vercel Serverless Functions** (`api/index.js`).
- **Database:** PostgreSQL (**Supabase** `ap-northeast-2`)
  - Runtime: Transaction Pooler Port `6543` (`?pgbouncer=true&connection_limit=5`).
  - Migration: Direct Session Pooler Port `5432`.
  - **Row Level Security (RLS):** Aktif di seluruh tabel (`Store`, `Product`, `Order`, `OrderItem`) + `REVOKE ALL` dari `anon` & `authenticated` + `ALTER DEFAULT PRIVILEGES`.
- **Cache & Rate Limiter:** **Upstash Redis** (`@upstash/redis` Stateless HTTP REST)
  - `cache:catalog_public` (TTL 3600 detik / 1 jam) dengan *in-memory filtering*.
  - `cache:kpi_summary` (TTL 180 detik / 3 menit).
  - Atomic Pipeline Rate Limiter (`INCR` + `EXPIRE NX`) per IP yang kebal terhadap pemalsuan header `X-Forwarded-For`.

---

## 2. Daftar Lengkap Endpoint API (14 Endpoints)

Semua response menggunakan standar JSON envelope:
- **Sukses:** `{ "success": true, "message": "...", "data": ..., "meta": ... }`
- **Error:** `{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }`

### A. Public Endpoints (Sisi Warung & Landing Page — Tanpa Token)

| No | Method & Path | Rate Limit | Kegunaan & Contoh Payload / Query |
|----|---------------|------------|-----------------------------------|
| 1 | `GET /` | 120/m | Info status service utama. |
| 2 | `GET /api/v1/health` | 120/m | Health check & pemanas Vercel Serverless (Cron Job). |
| 3 | `GET /api/v1/products` | 60/m | Katalog produk aktif Mayora (non-expired). Support query `?category=Biskuit&search=Roma` (tetap `X-Cache: HIT`). |
| 4 | `POST /api/v1/stores/register` | 10/m | Pendaftaran mitra warung baru.<br>Body: `{ "name": "Warung Berkah", "ownerName": "Pak Budi", "phone": "081234567890", "district": "Krian", "address": "Jl. Raya Krian No. 10" }` |
| 5 | `POST /api/v1/stores/lookup` | 10/m | **(Baru)** Cek status verifikasi & ambil `storeId` warung lama menggunakan nomor HP.<br>Body: `{ "phone": "081234560001" }`<br>Response `data`: `{ "id": "UUID", "name": "...", "district": "Krian", "isVerified": true }` |
| 6 | `POST /api/v1/orders` | 15/m | Checkout pesanan grosir (wajib `isVerified: true`, atomic stock decrement, `Prisma.Decimal`).<br>Body: `{ "storeId": "UUID", "paymentMethod": "COD", "notes": "Kirim pagi", "items": [{ "productId": "UUID", "quantity": 5 }] }` |
| 7 | `GET /api/v1/orders/track/:code` | 30/m | Lacak pesanan live via kode resi 8 karakter (contoh seed: `INB-2610-K8R4M9P2`, `INB-2610-T7M3W6Q9`, `INB-2610-W5R8N2X7`). PII toko otomatis disensor (`maskedPhone`). |

---

### B. Admin Endpoints (Sisi Gudang & Operasional Inbisco)
Wajib menyertakan header: `Authorization: Bearer <ADMIN_SECRET_KEY>`  
*(Seluruh endpoint admin diproteksi Rate Limit 60 req/menit, SHA-256 `timingSafeEqual`, dan header `Cache-Control: no-store`)*

| No | Method & Path | Kegunaan & Contoh Payload / Query |
|----|---------------|-----------------------------------|
| 8 | `GET /api/v1/admin/kpi` | Ringkasan KPI (`todayRevenue`, `todayOrders`, `totalOrders`, `activeStores`, `totalRegisteredStores`, `pendingDispatch`, `fastMovingProducts`). Di-cache di Redis 3 menit. |
| 9 | `GET /api/v1/admin/orders` | Daftar pesanan terfilter & terpaginasi.<br>Query: `?status=PENDING&district=Krian&paymentMethod=COD&search=Berkah&page=1&limit=20` |
| 10 | `PATCH /api/v1/admin/orders/:id/status` | Update status pesanan satu arah (*Strict State Machine* + Compare-And-Swap anti *double-restock* saat `CANCELLED`).<br>Body: `{ "status": "CONFIRMED" }` (`CONFIRMED \| PACKING \| DISPATCHED \| COMPLETED \| CANCELLED`) |
| 11 | `GET /api/v1/admin/inventory/fefo` | Inventaris gudang diurutkan berdasarkan `expiryDate ASC` (First Expired, First Out) lengkap dengan ringkasan & status `EXPIRED`, `DANGER` (< 3 bln), `WARNING` (< 6 bln), `SAFE`. |
| 12 | `GET /api/v1/admin/stores` | Direktori mitra warung terpaginasi.<br>Query: `?verified=true&district=Krian&page=1&limit=50` |
| 13 | `PATCH /api/v1/admin/stores/:id/verify` | Set status verifikasi toko secara eksplisit.<br>Body: `{ "isVerified": true }` |
| 14 | `POST /api/v1/admin/products` | **(Tambahan)** Tambah SKU produk Mayora baru ke gudang & invalidasi cache katalog.<br>Body: `{ "sku": "MYR-...", "name": "...", "category": "Biskuit", "cartonPrice": 215000, "retailPriceEst": 252000, "stockCartons": 100, "batchNumber": "BATCH-01", "expiryDate": "2027-06-01T00:00:00.000Z", "imageUrl": "https://..." }` |
| 15 | `PATCH /api/v1/admin/products/:id/stock` | **(Tambahan)** Update stok karton (pilih salah satu: `stockCartons` absolut ATAU `addCartons` relatif `+/-`), harga, atau batch FEFO secara atomik.<br>Body: `{ "addCartons": 50 }` atau `{ "stockCartons": 200, "batchNumber": "BATCH-02" }` |
| 16 | `GET /api/v1/admin/audit-logs` | **(Tambahan)** Jejak audit log mutasi administratif (perubahan status order, verifikasi warung, restok/edit produk) lengkap dengan snapshot `details` dan `ipAddress`.<br>Query: `?action=ORDER_STATUS_UPDATED&entityType=ORDER&entityId=...&page=1&limit=20` |

---

### C. SupplySync HQ & Extended Distributor Endpoints (Dual-Role: Mayora HQ & Depo Krian)

| No | Method & Path | Kegunaan & Contoh Payload |
|----|---------------|---------------------------|
| 17 | `POST /api/v1/auth/login` | Login Portal Operasional & Role Switcher (`HQ_ADMIN` vs `DISTRIBUTOR_DEPO`). Menghasilkan HMAC Bearer token.<br>Body: `{ "username": "bambang.krian@inbisco.co.id", "password": "Inbisco2026!", "role": "DISTRIBUTOR_DEPO" }` |
| 18 | `POST /api/v1/distributor/sales`<br>*(alias: `/api/v1/admin/sales`)* | Input Penjualan Harian Kasir / DSR (potong stok fisik atomik & rekam log sinkronisasi SAP).<br>Body: `{ "sku": "MYR-BISC-002", "quantityCartons": 25, "channel": "Grosir Warung & Warkop", "storeName": "Warkop Berkah" }` |
| 19 | `GET /api/v1/distributor/sales`<br>*(alias: `/api/v1/admin/sales`)* | Ambil daftar transaksi DSR harian + snapshot stok SKU gudang terkini. |
| 20 | `POST /api/v1/simulation/what-if`<br>*(alias: `/api/v1/admin/simulation/what-if`)* | Mesin Simulasi What-If Restock & Lead Time (kurva deplesi 14 hari, *runway* hari, *lost sales*, efisiensi Wingbox FTL %).<br>Body: `{ "sku": "MYR-RMK-01", "stockOnHand": 280, "ads": 175, "leadTimeDays": 3, "safetyStock": 200, "proposedRestockQty": 850 }` |
| 21 | `GET /api/v1/admin/stockout-risk` | Radar deteksi dini kerentanan stok (*runway* < 2 hari) & rekomendasi *Cross-Depot Rebalancing*. |
| 22 | `POST /api/v1/admin/cross-depot-transfer` | Eksekusi realokasi stok darurat antar-gudang (misal Depo Mojokerto $\to$ Depo Krian).<br>Body: `{ "sku": "MYR-RMK-01", "quantityCartons": 150, "sourceDepot": "Depo Mojokerto", "targetDepot": "CV Surya Krian Logistik" }` |
| 23 | `GET /api/v1/admin/restock-recommendations` | Mesin rekomendasi *Smart Replenishment* berbasis rumus $SS = Z \times \sigma_L \times ADS$ + kalkulator kubikasi truk Wingbox 65 m³ (FTL %). |
| 24 | `POST /api/v1/admin/batch-approve-po` | Persetujuan massal Purchase Order (*Batch PO Approval*) ke pabrik Mayora DC Pasuruan.<br>Body: `{ "depotName": "CV Surya Krian Logistik", "applyToStock": false, "items": [{ "sku": "MYR-RMK-01", "quantityCartons": 550 }] }` |
| 25 | `GET /api/v1/distributor/inbound-deliveries`<br>*(alias: `/api/v1/admin/inbound-deliveries`)* | Pelacakan truk pasokan pabrik (*Inbound DO* `DO-2026-0881`, koordinat GPS Tol Pandaan–Krian, status segel e-Lock `MYR-998240`). |
| 26 | `PATCH /api/v1/distributor/inbound-deliveries/:doNumber/confirm` | Konfirmasi BAST barang tiba di Gudang Krian & tambah stok karton otomatis.<br>Body: `{ "receivedBy": "Bambang Sudiro", "sealCode": "MYR-998240", "applyToStock": true }` |

---

## 3. Rangkuman 6 Putaran Security Audit & Hardening

1. **Database & PostgREST Lockout (`prisma/security_rls.sql`):**
   - `ENABLE ROW LEVEL SECURITY` + `REVOKE ALL` dari role `anon` dan `authenticated` + `ALTER DEFAULT PRIVILEGES` untuk tabel masa depan.
   - Penambahan 3 Foreign Key Indexes (`Order_storeId_idx`, `OrderItem_orderId_idx`, `OrderItem_productId_idx`).
2. **Authentication & Secret Hygiene (`src/middlewares/auth.middleware.js`):**
   - Token di-hash dengan **SHA-256** (32 byte tetap) sebelum `crypto.timingSafeEqual` sehingga panjang token tidak bocor via *timing attack*.
3. **Anti-Spoofing Stateless Rate Limiter (`src/middlewares/rateLimit.middleware.js`):**
   - Mengabaikan header `X-Forwarded-For` palsu dari klien; menggunakan `redis.pipeline()` (`INCR` + `EXPIRE NX`) agar bebas *zombie key* (`TTL -1`).
4. **Concurrency & Financial Integrity (`src/modules/orders/*`, `src/modules/admin/*`):**
   - Checkout menggunakan `Prisma.Decimal`, *conditional atomic stock decrement* (`stockCartons: { gte: quantity }`), menolak toko `isVerified: false` (`403`), dan menolak produk kedaluwarsa (`400`).
   - Pembatalan pesanan (`CANCELLED`) dikunci dengan **Compare-And-Swap (CAS)** agar dua klik paralel tidak mengembalikan stok 2 kali.
   - Penyesuaian stok admin (`addCartons`) menggunakan atomic `{ increment }` di PostgreSQL.
5. **Privacy (PII Redaction) & Enumeration Defense:**
   - Tracking publik (`GET /orders/track/:code`) menggunakan kode 8 karakter acak (`INB-YYMM-XXXXXXXX`), menyembunyikan `store.id`/`address`/`ownerName`, dan menyamarkan nomor HP (`0812****0001`).
   - Error duplikat nomor HP saat registrasi tidak membocorkan nama toko yang sudah terdaftar.
6. **Input Boundary & Cache Protection:**
   - Semua Zod body schema dikunci dengan `.strict()` (anti *mass-assignment*), batas ukuran body JSON `100kb`, batas jumlah item checkout (`<= 1000` karton per SKU pasca-merge), validasi protokol `http/https` pada `imageUrl` (anti `javascript:` XSS), serta filter katalog dilakukan *in-memory* di atas cache Redis.

---

## 4. Data Seed Aktif (Siap Dipakai Demo / Frontend Raka)
- **Nomor HP Warung Terverifikasi (bisa dites ke `POST /api/v1/stores/lookup`):**
  - `081234560001` — Toko Kelontong Berkah Jaya (Kec. Krian, `isVerified: true`)
  - `081234560002` — Warkop & Agen Kopi Cak Toni (Kec. Taman, `isVerified: true`)
  - `081234560003` — Warung Sembako Bu Sri Rejeki (Kec. Waru, `isVerified: true`)
  - `081234560004` — Toko Grosir Sumber Makmur (Kec. Sidoarjo, `isVerified: true`)
  - `081234560011` — Warkop Berkah (Kec. Krian, `isVerified: true`)
  - `081234560012` — Toko Sumber Rejeki (Kec. Balongbendo, `isVerified: true`)
  - `081234560013` — Warkop Sentosa (Kec. Prambon, `isVerified: true`)
  - `081234560014` — Toko Murah Jaya (Kec. Tarik, `isVerified: true`)
  - `081234560015` — Minimarket Barokah (Kec. Wonoayu, `isVerified: true`)
  - `081234560016` — Toko Makmur (Kec. Krian, `isVerified: true`)
- **Nomor HP Warung Belum Terverifikasi:**
  - `081234560005` — Warung Madura 24 Jam Al-Fath (Kec. Candi, `isVerified: false`)
  - `081234560006` — Kedai & Warung Pojok Gedangan (Kec. Gedangan, `isVerified: false`)
- **Kode Resi Pesanan Aktif (Mockup Prototype Sidoarjo Barat & General):**
  - `INB-2610-KR01` (`PACKING` — Warkop Berkah, Krian — COD TUNAI)
  - `INB-2610-KR02` (`DISPATCHED` — Toko Sumber Rejeki, Balongbendo — TEMPO 7 HARI)
  - `INB-2610-KR03` (`PENDING` — Warkop Sentosa, Prambon — COD TUNAI)
  - `INB-2610-KR04` (`CONFIRMED` — Toko Murah Jaya, Tarik — COD TUNAI)
  - `INB-2610-KR05` (`COMPLETED` — Minimarket Barokah, Wonoayu — TEMPO 7 HARI)
  - `INB-2610-KR06` (`PENDING` — Toko Makmur, Krian — COD TUNAI)
  - `INB-2610-K8R4M9P2` (`COMPLETED` — Krian)
  - `INB-2610-T7M3W6Q9` (`PACKING` — Taman)
  - `INB-2610-W5R8N2X7` (`PENDING` — Waru)
