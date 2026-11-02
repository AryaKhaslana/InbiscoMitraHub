-- =============================================================================
-- Inbisco MitraHub — Security Hardening Migration
-- 1. Enable Row Level Security (RLS) on all public tables so PostgREST (Data API)
--    blocks direct unauthenticated/client-side access.
-- 2. Revoke all direct table, sequence, and routine privileges from `anon`
--    and `authenticated` roles.
-- 3. Alter Default Privileges in schema `public` so any future tables created
--    via Prisma migrations do NOT automatically grant access to `anon` or `authenticated`.
-- =============================================================================

ALTER TABLE "public"."Store" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."OrderItem" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."Store" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."Product" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."Order" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."OrderItem" FROM anon, authenticated;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon, authenticated;

-- Foreign key indexes for JOIN, GROUP BY, and ON DELETE CASCADE performance
CREATE INDEX IF NOT EXISTS "Order_storeId_idx" ON "public"."Order"("storeId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "public"."OrderItem"("productId");

-- AuditLog table security and indexes
ALTER TABLE IF EXISTS "public"."AuditLog" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "public"."AuditLog" FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "public"."AuditLog"("action");

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon, authenticated;

-- Foreign key indexes for JOIN, GROUP BY, and ON DELETE CASCADE performance
CREATE INDEX IF NOT EXISTS "Order_storeId_idx" ON "public"."Order"("storeId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "public"."OrderItem"("productId");

-- AuditLog table security and indexes
ALTER TABLE IF EXISTS "public"."AuditLog" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "public"."AuditLog" FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "public"."AuditLog"("action");

