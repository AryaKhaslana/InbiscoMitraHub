# Progress Status: Inbisco MitraHub

## Completed `[x]`
- [x] Architectural Review & PRD Validation
- [x] Initialize `.memory-bank/` documentation
- [x] Project setup (`package.json`, `.env`, `.env.local`, `.env.example`, `.gitignore`, `vercel.json`)
- [x] Install dependencies & Supabase Agent Skills (`npx skills add supabase/agent-skills`)
- [x] Prisma Schema (`prisma/schema.prisma`) pushed to Supabase PostgreSQL & Database Seeding (`prisma/seed.js`)
- [x] Core Infrastructure & Feature Modules (`products`, `stores`, `orders`, `admin`)
- [x] **Security Audit Round 1, Round 2, & Round 3 (Attack-Verified):**
  - [x] Supabase RLS enabled on all 4 tables + `REVOKE ALL` + `ALTER DEFAULT PRIVILEGES` (`prisma/security_rls.sql`)
  - [x] SHA-256 + `crypto.timingSafeEqual` Admin Bearer Auth & CSPRNG-generated `ADMIN_SECRET_KEY`
  - [x] Anti-Spoofing Upstash Redis Rate Limiter across all public AND `/api/v1/admin/*` routes
  - [x] HTTP Parameter Pollution (HPP) protection & In-Memory Redis Cache filtering on `GET /api/v1/products`
  - [x] Store Name Enumeration protection & KPI Cache-Busting prevention on `POST /api/v1/stores/register`
  - [x] Unverified Store Checkout Guard (`403 Forbidden`) & Expired Batch Checkout Guard (`400 Bad Request`) on `POST /api/v1/orders`
  - [x] Public Order Tracking PII & Credential Redaction (`store.id` & `order.storeId` stripped, `maskedPhone`) + 8-char Tracking Codes (`INB-YYMM-XXXXXXXX`)
  - [x] Explicit boolean `{ isVerified }` on `PATCH /api/v1/admin/stores/:id/verify`, `http/https` URI protocol validation on `imageUrl`, and pagination on `GET /api/v1/admin/stores`
  - [x] Compare-And-Swap (CAS) concurrency guard on `PATCH /api/v1/admin/orders/:id/status`
  - [x] **Round 4 Concurrency & DB Index Hardening:** Atomic `redis.pipeline()` (`INCR` + `EXPIRE NX`), production lock on `DISABLE_RATE_LIMIT`, atomic `{ increment }` on `updateProductStock`, and 3 FK indexes (`Order_storeId_idx`, `OrderItem_orderId_idx`, `OrderItem_productId_idx`) applied to Supabase.
  - [x] **Round 5 Boundary & Schema Hardening:** Post-merge 1000-carton cap, `.strict()` body schemas, mutual exclusion of `stockCartons`/`addCartons`, `Decimal(12,2)` & pagination `page <= 10000` upper bounds, `100kb` body size limit, and `/api/v1/health` metadata redaction.

## In Progress `[-]`
- *(None — All Round 1, Round 2, and Round 3 security findings resolved and verified)*

## Planned Backlog `[ ]`
- [ ] Integrasi CORS & Deployment ke Vercel Production
