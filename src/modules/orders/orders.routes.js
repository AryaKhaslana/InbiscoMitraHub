import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import * as ordersController from './orders.controller.js';
import { createOrderSchema, trackOrderParamsSchema } from './orders.schema.js';

const router = Router();

/**
 * POST /api/v1/orders
 * Public endpoint to submit a wholesale restock order with atomic inventory deduction.
 */
router.post('/', validate(createOrderSchema), ordersController.createOrder);

/**
 * GET /api/v1/orders/track/:code
 * Public endpoint to check live order status by tracking code (e.g. INB-2610-A9F2).
 */
router.get(
  '/track/:code',
  validate({ params: trackOrderParamsSchema }),
  ordersController.trackOrder
);

export default router;

