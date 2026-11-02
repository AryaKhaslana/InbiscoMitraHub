# 🏢 Inbisco MitraHub & SupplySync FMCG Enterprise

<div align="center">

[![GTNIC 2026](https://img.shields.io/badge/Competition-GTNIC%202026-b91c1c.svg?style=for-the-badge&logo=target)](https://inbisco-mitrahub.vercel.app)
[![Production](https://img.shields.io/badge/Deployment-Vercel%20Live-000000.svg?style=for-the-badge&logo=vercel)](https://inbisco-mitrahub.vercel.app)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js%2024.x-339933.svg?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E.svg?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Upstash Redis](https://img.shields.io/badge/Cache-Upstash%20Redis-FF1493.svg?style=for-the-badge&logo=redis)](https://upstash.com)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma%206-2D3748.svg?style=for-the-badge&logo=prisma)](https://prisma.io)

<br />

**Next-Gen FMCG Micro-Distribution Ecosystem & Macro-Logistics Intelligence Engine**  
*Mendigitalkan Rantai Pasok Grosir Tradisional Mayora Sidoarjo: Dari Pemesanan Toko Ritel hingga Prescriptive Restocking Pabrik.*

[🚀 **Jelajahi Live Demo**](https://inbisco-mitrahub.vercel.app) • [📋 **Panduan QC & Arsitektur**](file:///home/wisesa/.gemini/antigravity/brain/242aaef9-3e0f-4c5b-b3e2-3e19143a0136/qc_roadmap_inbisco_mitrahub.md) • [📚 **Dokumentasi API**](#-direktori-endpoint-api-26-endpoints)

</div>

---

## 📌 Latar Belakang & Masalah Riil (The "Why")

Distribusi FMCG (*Fast-Moving Consumer Goods*) di Indonesia untuk kategori General Trade (toko kelontong, warkop, minimarket lokal) menghadapi 4 kendala kritis:
1. **The Bullwhip Effect:** Distorsi informasi permintaan dari warung ke depo hingga pabrik manufaktur, memicu overstock barang slow-moving dan kelangkaan barang fast-moving.
2. **Blind Spot Stok Fisik:** Depo distributor sering tidak memiliki visibilitas *real-time* saldo stok saat sales lapangan (DSR) menerbitkan nota keluar.
3. **Penyusutan Kedaluwarsa (FEFO Risk):** Produk biskuit dan sereal berisiko kedaluwarsa di gudang karena tidak adanya penegakan alokasi *First Expired, First Out*.
4. **Lead Time & Stockout Vulnerability:** Proses pengajuan restock mandiri yang lambat menyebabkan warung kehabisan stok (*lost sales*) selama 3–5 hari.

**Inbisco MitraHub & SupplySync** hadir sebagai ekosistem tertutup (closed-loop) yang menghubungkan **Toko Mitra Ritel**, **Depo Distribusi Regional (CV Surya Krian Logistik)**, dan **Mayora Enterprise HQ Governance** dalam satu arsitektur terintegrasi.

---

## 🏗️ Arsitektur Sistem Dua Sisi (Dual-Side Engine)

```mermaid
flowchart TD
    subgraph PUBLIC["1. PUBLIC STOREFRONT (Toko Mitra Ritel)"]
        A["Toko Kelontong / Grosir Sidoarjo"] -->|Pilih SKU & Pesan Kartonan| B["Katalog Grosir Resmi Mayora"]
        B -->|Checkout COD / Tempo 7 Hari| C["Penerbitan Order & Resi Unik"]
        C -->|Pelacakan Terproteksi PII| D["Live Tracking Status Pesanan"]
    end

    subgraph ENGINE["2. DATA CORE & STATELESS ENGINE"]
        DB[("Supabase PostgreSQL (RLS Hardened)")]
        Cache[("Upstash Redis (Rate Limiter & In-Memory Filter)")]
        Audit[("Audit Trail Log Terpusat")]
    end

    subgraph DEPO["3. MICRO OPERATIONS (Depo Krian Distribusi)"]
        E["Input Penjualan Harian DSR"] -->|Potong Stok Fisik Realtime| DB
        F["Inventori Gudang FEFO"] -->|Koreksi Stok & CRUD Produk| DB
        G["Tracking Truk Inbound Wingbox"] -->|Konfirmasi e-BAST di Bay Gudang| DB
    end

    subgraph HQ["4. MACRO INTELLIGENCE (Mayora Enterprise HQ)"]
        H["Executive Macro Overview"] -->|Agregasi KPI & Fill-Rate Jaringan| Cache
        I["Stockout Risk Radar"] -->|Analisis Runway & DoI Kritis| DB
        I -->|Opsi A: Rebalancing Cepat| J["Cross-Depot Transfer (Depo Mojokerto)"]
        I -->|Opsi B: Restock Pabrik| K["Smart Replenishment Engine (Batch PO)"]
        L["What-if Restock Simulator"] -->|Simulasi Lonjakan Permintaan| I
    end

    C --> DB
    E --> Audit
    J --> DB
    K --> G
    DB --> Audit
```

---

## ✨ Fitur Unggulan Sistem

### 🛍️ Sisi Publik: Inbisco MitraHub (Storefront)
* **Katalog Grosir Resmi Mayora:** 8 SKU unggulan FMCG (*Roma Kelapa, Beng-Beng, Torabika Duo, Kopiko, Energen, Le Minerale, Teh Pucuk, Malkist*) dengan kalkulasi harga karton pabrik dan estimasi PPN 11%.
* **Sistem Verifikasi Instan Toko Mitra:** Lookup otomatis nomor WhatsApp (`081234560001` - Toko Kelontong Berkah Jaya) dengan opsi pembayaran Tempo 7 Hari atau COD.
* **Pelacakan Pesanan Terproteksi PII:** Cek status pesanan (*PENDING $\to$ PACKING $\to$ SHIPPED $\to$ COMPLETED*) dengan sensor privasi otomatis (*masked phone*).
* **Surat Tanda Registrasi Resmi Kemitraan:** Generator tanda bukti pendaftaran toko mitra dengan kop surat resmi PT Inbisco Niagatama Semesta yang siap dicetak/PDF.

### 🏭 Sisi Operasional: SupplySync Depo Krian (CV Surya Krian Logistik)
* **Input Penjualan Harian (DSR):** Pemotongan saldo fisik inventori seketika begitu faktur kasir/DSR diterbitkan, lengkap dengan preview sisa stok dan riwayat transaksi tersinkron.
* **Inventori FEFO & Full CRUD:** Manajemen mutasi inventori berbasis tanggal kedaluwarsa (*First Expired, First Out*), penyesuaian stok cepat (`+50/-25` dus), penambahan SKU baru lewat formulir modal, dan penonaktifan SKU.
* **Tracking Armada Inbound & e-BAST:** Telemetri truk Wingbox dari DC Pasuruan (Tol Pandaan $\to$ Sumo $\to$ Krian Bay 2) dan verifikasi digital tanda terima barang.

### 🧠 Sisi Tata Kelola: SupplySync Mayora HQ Intelligence
* **Stockout Risk Radar:** Deteksi dini kerentanan stok berbasis perhitungan *Average Daily Sales* (ADS) dan *Days of Inventory* (DoI / Runway).
* **Cross-Depot Transfer:** Eksekusi realokasi stok darurat antar-gudang (contoh: transfer 209 dus dari Depo Mojokerto surplus ke Hub Krian).
* **Smart Replenishment Engine:** Rekomendasi kuantitas restock preskriptif berbasis formula Safety Stock $SS = Z \times \sigma_L \times ADS$ dan otorisasi massal *Batch PO Approval*.
* **What-if Restock Simulator:** Simulasi stres interaktif untuk menguji lonjakan permintaan (+10% s/d +50%) dan variasi *lead time* supplier (1 s/d 7 hari).
* **Pusat Notifikasi Live (Bell Header):** Notifikasi dinamis dari database (stok kritis, armada jalan, order masuk), dilengkapi scroll halus, dismiss per item (X), dan pembersihan daftar.
* **Audit Trail & Log Terpusat:** Rekam jejak seluruh mutasi administratif, login, DSR, dan sync ERP Mayora SAP S/4HANA lengkap dengan ekspor CSV.

---

## 🔑 Kredensial Demo (Siap Uji Juri GTNIC)

Aplikasi telah dilengkapi tombol **Autofill Cepat** di portal login untuk memudahkan pengujian:

| Role | Username / Identifier | Password | Hak Akses & Cakupan |
|:---|:---|:---|:---|
| **Mayora Admin (HQ)** | `ops.hq@mayora.co.id` | `Inbisco2026!` | Macro Governance, Radar Risiko, Otorisasi PO Pabrik, Simulasi What-if, Log Audit Trail |
| **Depo Krian Ops** | `bambang.krian@inbisco.co.id` | `Inbisco2026!` | Micro Operations, Input DSR Ritel, Inventori Gudang FEFO, Antrean Order Toko, e-BAST Inbound |
| **Toko Mitra Verified** | `081234560001` *(Nomor HP)* | *Tanpa Password* | Toko Kelontong Berkah Jaya (Krian) — Tes Checkout Grosir Tempo 7 Hari & Lacak Resi |

---

## 🛠️ Tech Stack & Infrastruktur

| Lapisan | Teknologi | Penjelasan |
|:---|:---|:---|
| **Frontend** | React 19, Vite, Tailwind CSS | Single Page Application ultra-cepat, responsive di zoom 100% laptop, modul komponen modular |
| **Icons & UI** | Lucide React, Canvas Confetti | Ikonografi standar enterprise dan mikro-interaksi responsif |
| **Backend API** | Node.js (ESM), Express.js | Arsitektur controller-service-repository berlapis (Clean Architecture) |
| **Hosting & Edge** | Vercel Serverless Functions | Edge caching, automated builds, domain kustom produksi |
| **Database** | PostgreSQL (Supabase) | RLS aktif di seluruh tabel, strict relational foreign keys, zero-loss migrations |
| **Cache & Rate Limit** | Upstash Redis | Stateless HTTP REST cache anti-cold-start, atomic token bucket rate limiter |
| **ORM & Validasi** | Prisma 6, Zod Validation | Skema tipe ketat, sanitasi input `.strict()`, transaksi atomik database |

---

## 📡 Direktori Endpoint API (26 Endpoints)

Seluruh response API menggunakan standar envelope JSON konsisten:
```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 45 }
}
```

### A. Public & Storefront Endpoints
* `GET /api/v1/health` — Pemeriksaan status server & pemanas serverless.
* `GET /api/v1/products` — Katalog produk aktif (dukungan filter kategori & search in-memory Redis).
* `POST /api/v1/stores/lookup` — Cek verifikasi warung via nomor WhatsApp.
* `POST /api/v1/stores/register` — Pendaftaran calon mitra toko baru.
* `POST /api/v1/orders` — Checkout grosir (validasi saldo stok atomik & status toko).
* `GET /api/v1/orders/track/:code` — Lacak status pengiriman via resi 8 digit.
* `POST /api/v1/contact` — Pengiriman formulir konsultasi / pesan kemitraan.

### B. Depo Krian Micro-Operations
* `POST /api/v1/distributor/sales` — Input transaksi kasir DSR (potong stok gudang atomik).
* `GET /api/v1/distributor/sales` — Riwayat transaksi DSR harian.
* `GET /api/v1/distributor/inbound-deliveries` — Daftar surat jalan (DO) armada masuk.
* `PATCH /api/v1/distributor/inbound-deliveries/:doNumber/confirm` — Konfirmasi penerimaan e-BAST.

### C. Mayora Enterprise HQ Macro-Governance
* `POST /api/v1/auth/login` — Autentikasi dual-role dengan penerbitan Bearer token.
* `GET /api/v1/admin/kpi` — Rekap KPI makro jaringan (omzet, fill-rate, toko aktif).
* `GET /api/v1/admin/orders` — Manajemen antrean pesanan toko mitra.
* `PATCH /api/v1/admin/orders/:id/status` — Pembaruan status pesanan (*State Machine lock*).
* `GET /api/v1/admin/inventory/fefo` — Inventaris gudang FEFO lengkap dengan status kedaluwarsa.
* `POST /api/v1/admin/products` — Penambahan SKU baru ke gudang.
* `PATCH /api/v1/admin/products/:id/stock` — Penyesuaian stok karton fisik gudang.
* `DELETE /api/v1/admin/products/:id` — Penonaktifan / arsip SKU.
* `GET /api/v1/admin/stockout-risk` — Radar analisis runway inventori dan defisit rupiah.
* `POST /api/v1/admin/cross-depot-transfer` — Eksekusi transfer stok darurat antar-gudang.
* `GET /api/v1/admin/restock-recommendations` — Mesin rekomendasi Safety Stock & FTL Wingbox.
* `POST /api/v1/admin/batch-approve-po` — Persetujuan massal PO restock ke pabrik Mayora.
* `POST /api/v1/simulation/what-if` — Mesin simulasi Monte Carlo lonjakan permintaan.
* `GET /api/v1/admin/audit-logs` — Jejak audit trail seluruh aksi sistem terpaginasi.
* `POST /api/v1/admin/sync-sap` — Sinkronisasi manual on-demand dengan ERP SAP S/4HANA.

---

## 💻 Panduan Menjalankan di Lokal (Local Setup)

### 1. Prasyarat Sistem
* Node.js $\ge$ 18.x (Disarankan Node.js 20.x atau 24.x)
* Akun Supabase (PostgreSQL)
* Akun Upstash (Redis)

### 2. Kloning Repositori
```bash
git clone https://github.com/AryaKhaslana/Api-InbiscoMitraHub.git
cd Api-InbiscoMitraHub
```

### 3. Konfigurasi Environment (`.env`)
Buat file `.env` di root direktori dengan menyalin template berikut:
```env
PORT=3000
NODE_ENV=development

# Database Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Upstash Redis REST
UPSTASH_REDIS_REST_URL="https://[YOUR-UPSTASH-INSTANCE].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[YOUR-UPSTASH-TOKEN]"

# Security Secret
ADMIN_SECRET_KEY="Inbisco2026!"
```

### 4. Instalasi Dependensi & Database Migration
```bash
# Install backend dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Install frontend dependencies
npm --prefix frontend install
```

### 5. Jalankan Aplikasi
```bash
# Mode Development (Full-stack concurrently)
npm run dev

# Atau jalankan Frontend terpisah:
npm --prefix frontend run dev
```
Buka browser di `http://localhost:5173` untuk Storefront & Portal Operasional.

---

## 🏆 Kesiapan Kompetisi GTNIC 2026

* **Zero Mock Data:** Seluruh angka di Beranda, Inventori FEFO, Radar Risiko, hingga Notifikasi Header terhubung langsung ke live database Supabase & Upstash.
* **Audit Trail Transparan:** Setiap interaksi terindeks dengan IP Address, role pelaksana, dan waktu WIB.
* **High Availability & Performance:** Vercel Global Edge Network dengan latensi respon sub-100ms.

---

<div align="center">

**Dikembangkan dengan dedikasi untuk Kompetisi GTNIC 2026**  
*Kolaborasi Inovasi Distribusi Digital: PT Inbisco Niagatama Semesta & Tim Pengembang MitraHub.*

</div>
