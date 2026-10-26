import { Router } from 'express';
import { rateLimit } from '../../middlewares/rateLimit.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as ordersController from './orders.controller.js';
import { createOrderSchema, trackOrderParamsSchema } from './orders.schema.js';

const router = Router();

/**
 * POST /api/v1/orders
 * Public endpoint to submit a wholesale restock order with atomic inventory deduction.
 * Rate-limited to 15 orders per minute per IP to prevent stock depletion bots.
 */
router.post(
  '/',
  rateLimit({ prefix: 'rl:orders_create', max: 15, windowSeconds: 60 }),
  validate(createOrderSchema),
  ordersController.createOrder
);

/**
 * GET /api/v1/orders/track/:code
 * Public endpoint to check live order status by tracking code (e.g. INB-2610-A9F2).
 * Rate-limited to 30 lookups per minute per IP to prevent tracking code enumeration.
 */
router.get(
  '/track/:code',
  rateLimit({ prefix: 'rl:orders_track', max: 30, windowSeconds: 60 }),
  validate({ params: trackOrderParamsSchema }),
  ordersController.trackOrder
);

export default router;
