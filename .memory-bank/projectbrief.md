# Project Brief: Inbisco MitraHub (Backend & Data Engine)

## 1. Executive Summary
**Inbisco MitraHub** adalah platform B2B restock FMCG mandiri yang mendigitalisasi rantai pasok antara **PT Inbisco Niagatama Semesta** (distributor resmi produk Mayora di Krian & Sidoarjo) dengan mitra UMKM (warung kelontong, warkop, agen ritel).

Proyek ini memiliki dua tujuan utama:
1. **Implementasi Industri (PKL/Magang):** Sistem operasional distribusi di PT Inbisco Niagatama Semesta.
2. **Kompetisi Nasional (GTNIC 2026):** Sub-tema *Transformasi Digital Bisnis & UMKM*.

## 2. Core Requirements
- **Public Catalog & Fast Restock:** Warung dapat melihat katalog grosir produk Mayora secara cepat (di-cache via Upstash Redis) dan melakukan checkout pesanan tanpa menunggu kanvaser manual.
- **Atomic Inventory & Order Engine:** Checkout memotong stok karton (`stockCartons`) secara atomik di dalam database transaction (`prisma.$transaction`), mencegah *overselling* / *race condition*, dan men-generate kode resi unik (`INB-YYMM-XXXX`).
- **Live Order Tracking:** Pelacakan status pesanan publik secara real-time menggunakan kode resi.
- **Operational Admin Dashboard:**
  - Ringkasan 4 KPI utama + Fast Moving Products (di-cache 3 menit).
  - Manajemen pesanan terklaster per kecamatan di Sidoarjo dengan *Strict State Machine* (`PENDING -> CONFIRMED -> PACKING -> DISPATCHED -> COMPLETED`, atau `CANCELLED` dengan auto-restock).
  - Gudang berbasis **FEFO (First Expired, First Out)** dengan indikator peringatan kedaluwarsa (`DANGER` < 3 bulan, `WARNING` < 6 bulan, `SAFE`).
  - Direktori & verifikasi kemitraan toko/warung serta manajemen produk/stok.

## 3. Scope Boundaries & Non-Goals
- **In-Scope:** Standalone RESTful API (`Express.js` di atas Vercel Serverless), PostgreSQL (Supabase Transaction Pooler), Caching (Upstash Redis HTTP), Validasi (Zod), Single-Token Bearer Auth untuk Admin, Seeding data realistis Mayora & Sidoarjo.
- **Out-of-Scope:** Payment gateway pihak ketiga otomatis (menggunakan skema distribusi riil: `COD` dan `TEMPO_7_DAYS`), multi-role RBAC kompleks, dan aplikasi Frontend (dikerjakan terpisah oleh Raka menggunakan Next.js + Tailwind).

