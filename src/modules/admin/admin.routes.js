import { Router } from 'express';
import { adminAuth } from '../../middlewares/auth.middleware.js';
import { rateLimit } from '../../middlewares/rateLimit.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as adminController from './admin.controller.js';
import {
  adminAuditLogsQuerySchema,
  adminOrdersQuerySchema,
  adminStoresQuerySchema,
  batchApprovePoSchema,
  confirmInboundDeliverySchema,
  createProductSchema,
  crossDepotTransferSchema,
  dailySalesInputSchema,
  dailySalesQuerySchema,
  doNumberParamSchema,
  idParamSchema,
  portalLoginSchema,
  updateOrderStatusSchema,
  updateProductStockSchema,
  verifyStoreBodySchema,
  whatIfSimulationSchema,
} from './admin.schema.js';

const router = Router();
export const authRouter = Router();
export const simulationRouter = Router();
export const distributorRouter = Router();

/**
 * Portal Auth Router (/api/v1/auth)
 */
authRouter.post(
  '/login',
  rateLimit({ prefix: 'rl:portal_login', max: 20, windowSeconds: 60 }),
  validate({ body: portalLoginSchema }),
  adminController.loginPortal
);

/**
 * Simulation Router (/api/v1/simulation)
 */
simulationRouter.use(rateLimit({ prefix: 'rl:sim_api', max: 60, windowSeconds: 60 }));
simulationRouter.use(adminAuth);
simulationRouter.post(
  '/what-if',
  validate({ body: whatIfSimulationSchema }),
  adminController.runWhatIfSimulation
);

/**
 * Distributor Depo Router (/api/v1/distributor)
 */
distributorRouter.use(rateLimit({ prefix: 'rl:dist_api', max: 60, windowSeconds: 60 }));
distributorRouter.use(adminAuth);
distributorRouter.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
distributorRouter.get(
  '/sales',
  validate({ query: dailySalesQuerySchema }),
  adminController.getDailySalesLogs
);
distributorRouter.post(
  '/sales',
  validate({ body: dailySalesInputSchema }),
  adminController.recordDailySales
);
distributorRouter.get('/inbound-deliveries', adminController.getInboundDeliveries);
distributorRouter.patch(
  '/inbound-deliveries/:doNumber/confirm',
  validate({ params: doNumberParamSchema, body: confirmInboundDeliverySchema }),
  adminController.confirmInboundDelivery
);

// Rate-limit all /api/v1/admin/* requests BEFORE authentication to block token brute-force attempts
router.use(rateLimit({ prefix: 'rl:admin_api', max: 60, windowSeconds: 60 }));

// Protect all /api/v1/admin/* endpoints with Bearer <ADMIN_SECRET_KEY> and prevent browser/proxy caching
router.use(adminAuth);
router.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

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

/**
 * DELETE /api/v1/admin/products/:id
 * Delete or soft-archive product SKU
 */
router.delete(
  '/products/:id',
  validate({ params: idParamSchema }),
  adminController.deleteProduct
);

/**
 * GET /api/v1/admin/audit-logs
 * Paginated activity trail of admin mutations (filters: action, entityType, entityId, page, limit)
 */
router.get(
  '/audit-logs',
  validate({ query: adminAuditLogsQuerySchema }),
  adminController.getAuditLogs
);

/**
 * SupplySync HQ & Extended Distributor Endpoints under /api/v1/admin/*
 */
router.get('/stockout-risk', adminController.getStockoutRiskAnalysis);

router.post(
  '/cross-depot-transfer',
  validate({ body: crossDepotTransferSchema }),
  adminController.executeCrossDepotTransfer
);

router.get('/restock-recommendations', adminController.getRestockRecommendations);

router.post(
  '/batch-approve-po',
  validate({ body: batchApprovePoSchema }),
  adminController.batchApprovePo
);

router.post(
  '/simulation/what-if',
  validate({ body: whatIfSimulationSchema }),
  adminController.runWhatIfSimulation
);

router.get(
  '/sales',
  validate({ query: dailySalesQuerySchema }),
  adminController.getDailySalesLogs
);

router.post(
  '/sales',
  validate({ body: dailySalesInputSchema }),
  adminController.recordDailySales
);

router.get('/inbound-deliveries', adminController.getInboundDeliveries);

router.patch(
  '/inbound-deliveries/:doNumber/confirm',
  validate({ params: doNumberParamSchema, body: confirmInboundDeliverySchema }),
  adminController.confirmInboundDelivery
);

/**
 * Operations & Export Helpers
 */
router.post('/sync-sap', adminController.syncSap);
router.get('/manifest/daily', adminController.getDailyManifest);
router.get('/orders/export/csv', adminController.exportOrdersCsv);
router.get('/distributors', adminController.getDistributorNodes);

export default router;

