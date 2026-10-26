import { Router } from 'express';
import { rateLimit } from '../../middlewares/rateLimit.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as productsController from './products.controller.js';
import { productsQuerySchema } from './products.schema.js';

const router = Router();

/**
 * GET /api/v1/products
 * Public endpoint to fetch active Mayora product catalog (cached in Redis `cache:catalog_public` TTL 3600s)
 */
router.get(
  '/',
  rateLimit({ prefix: 'rl:products_list', max: 60, windowSeconds: 60 }),
  validate({ query: productsQuerySchema }),
  productsController.listPublicProducts
);

export default router;
