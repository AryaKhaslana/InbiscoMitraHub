# Inbisco MitraHub — Backend & Data Engine

Backend REST API untuk **Inbisco MitraHub** (Platform B2B Restock Mandiri UMKM Warung & Warkop di Sidoarjo — **PT Inbisco Niagatama Semesta** / **GTNIC 2026**).

---

## 1. Tech Stack & Architecture
- **Runtime:** Node.js (ES Modules / `"type": "module"`)
- **Framework:** Express.js (Wrapped for **Vercel Serverless Functions** via `api/index.js`)
- **Database:** PostgreSQL on **Supabase**
  - Transaction Pooler (`:6543?pgbouncer=true&connection_limit=1`) untuk Serverless runtime
  - Session Pooler (`:5432`) untuk Prisma schema migration
- **ORM:** Prisma ORM
- **Cache Engine:** **Upstash Redis** (`@upstash/redis` Stateless HTTP REST client) dengan *fail-open* wrapper
- **Validation:** Zod
- **Authentication:** Single-Token Bearer (`Authorization: Bearer <ADMIN_SECRET_KEY>`) dengan proteksi `crypto.timingSafeEqual`

---

## 2. Directory Structure
```text
.
├── api/
│   └── index.js                      # Entry point Vercel Serverless & Local Server
├── prisma/
│   ├── schema.prisma                 # Database schema (Store, Product, Order, OrderItem)
│   └── seed.js                       # Seeder produk Mayora, FEFO batch, & toko Sidoarjo
├── src/
│   ├── config/
│   │   ├── database.js               # Prisma Client singleton
│   │   └── redis.js                  # Upstash Redis HTTP client & fail-open cache helpers
│   ├── middlewares/
│   │   ├── auth.middleware.js        # Constant-time Bearer token auth
│   │   ├── error.middleware.js       # Global error & 404 handler
│   │   └── validate.middleware.js    # Zod schema validation middleware
│   ├── modules/
│   │   ├── admin/                    # KPI, Order State Machine, FEFO Inventory, Store Verify, Stock Management
│   │   ├── orders/                   # Atomic checkout transaction & public tracking
│   │   ├── products/                 # Cached public product catalog
│   │   └── stores/                   # Partner store registration (Sidoarjo districts)
│   └── utils/
│       ├── orderCode.js              # Tracking code generator (INB-YYMM-XXXX)
│       └── response.js               # Standard JSON response envelope & AppError
├── .env.example
├── package.json
└── vercel.json
```

---

## 3. API Endpoints Summary

### A. Public Endpoints (Warung & Landing Page)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/v1/health` | Health check & Vercel warm-up endpoint |
| `GET` | `/api/v1/products` | Katalog produk aktif Mayora (Cache Redis `cache:catalog_public` TTL 3600s) |
| `POST` | `/api/v1/stores/register` | Registrasi mitra warung/toko baru (validasi HP unik & Kecamatan Sidoarjo) |
| `POST` | `/api/v1/orders` | Checkout grosir atomik (`prisma.$transaction`), potong `stockCartons`, generate resi `INB-YYMM-XXXX` |
| `GET` | `/api/v1/orders/track/:code` | Lacak status pesanan live via kode resi |

### B. Admin Endpoints (`Authorization: Bearer <ADMIN_SECRET_KEY>`)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/v1/admin/kpi` | 4 Metrik KPI + Fast Moving Products (Cache Redis `cache:kpi_summary` TTL 180s) |
| `GET` | `/api/v1/admin/orders` | Filter pesanan berdasarkan `?status=...&district=...&page=1&limit=20` |
| `PATCH` | `/api/v1/admin/orders/:id/status` | Mutasi status satu arah (*Strict State Machine*) + auto-restock saat `CANCELLED` |
| `GET` | `/api/v1/admin/inventory/fefo` | Inventaris gudang urut `expiryDate ASC` (FEFO Alert: `DANGER` < 3 bln, `WARNING` < 6 bln) |
| `GET` | `/api/v1/admin/stores` | Daftar mitra toko dengan filter `?verified=true\|false&district=...` |
| `PATCH` | `/api/v1/admin/stores/:id/verify` | Toggle/set status verifikasi mitra toko (`isVerified`) |
| `POST` | `/api/v1/admin/products` | Tambah SKU produk baru & invalidasi cache katalog |
| `PATCH` | `/api/v1/admin/products/:id/stock` | Update stok karton (`stockCartons` / `addCartons`), harga, atau batch FEFO |

