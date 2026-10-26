import { Router } from 'express';
import * as productsController from './products.controller.js';

const router = Router();

/**
 * GET /api/v1/products
 * Public endpoint to fetch active Mayora product catalog (cached in Redis `cache:catalog_public` TTL 3600s)
 */
router.get('/', productsController.listPublicProducts);

export default router;

