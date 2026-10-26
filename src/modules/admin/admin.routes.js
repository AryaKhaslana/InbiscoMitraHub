import { Router } from 'express';
import { adminAuth } from '../../middlewares/auth.middleware.js';
import { rateLimit } from '../../middlewares/rateLimit.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as adminController from './admin.controller.js';
import {
  adminOrdersQuerySchema,
  adminStoresQuerySchema,
  createProductSchema,
  idParamSchema,
  updateOrderStatusSchema,
  updateProductStockSchema,
  verifyStoreBodySchema,
} from './admin.schema.js';

const router = Router();

// Rate-limit all /api/v1/admin/* requests BEFORE authentication to block token brute-force attempts
router.use(rateLimit({ prefix: 'rl:admin_api', max: 60, windowSeconds: 60 }));

// Protect all /api/v1/admin/* endpoints with Bearer <ADMIN_SECRET_KEY>
router.use(adminAuth);

/**
 * GET /api/v1/admin/kpi
 * 4 KPI summary metrics + fast moving products (Redis cached `cache:kpi_summary`, TTL 180s)
 */
router.get('/kpi', adminController.getKpiSummary);

/**
 * GET /api/v1/admin/orders
 * Filter orders by status and Sidoarjo district with pagination
 */
router.get(
  '/orders',
  validate({ query: adminOrdersQuerySchema }),
  adminController.getOrders
);

/**
 * PATCH /api/v1/admin/orders/:id/status
 * Mutate order status via strict one-way state machine
 */
router.patch(
  '/orders/:id/status',
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  adminController.updateOrderStatus
);

/**
 * GET /api/v1/admin/inventory/fefo
 * Warehouse inventory sorted by expiryDate ASC with FEFO alerts (< 3m DANGER, < 6m WARNING)
 */
router.get('/inventory/fefo', adminController.getFefoInventory);

/**
 * GET /api/v1/admin/stores
 * List partner stores with optional ?verified=true|false&district=...&page=1&limit=50
 */
router.get(
  '/stores',
  validate({ query: adminStoresQuerySchema }),
  adminController.getStores
);

/**
 * PATCH /api/v1/admin/stores/:id/verify
 * Explicitly set store isVerified status
 */
router.patch(
  '/stores/:id/verify',
  validate({ params: idParamSchema, body: verifyStoreBodySchema }),
  adminController.verifyStore
);

/**
 * POST /api/v1/admin/products
 * Create a new Mayora product SKU and invalidate public catalog cache
 */
router.post(
  '/products',
  validate({ body: createProductSchema }),
  adminController.createProduct
);

/**
 * PATCH /api/v1/admin/products/:id/stock
 * Update product carton stock, pricing, or FEFO batch/expiry and invalidate public catalog cache
 */
router.patch(
  '/products/:id/stock',
  validate({ params: idParamSchema, body: updateProductStockSchema }),
  adminController.updateProductStock
);

export default router;
