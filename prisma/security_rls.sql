-- =============================================================================
-- Inbisco MitraHub — Security Hardening Migration
-- 1. Enable Row Level Security (RLS) on all public tables so PostgREST (Data API)
--    blocks direct unauthenticated/client-side access.
-- 2. Revoke all direct table privileges from `anon` and `authenticated` roles.
--    Note: Backend connects via Prisma as `postgres` (table owner/bypassrls),
--    so backend operations remain 100% unaffected.
-- =============================================================================

ALTER TABLE "public"."Store" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."OrderItem" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."Store" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."Product" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."Order" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."OrderItem" FROM anon, authenticated;

