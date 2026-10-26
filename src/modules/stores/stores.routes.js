import { Router } from 'express';
import { rateLimit } from '../../middlewares/rateLimit.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as storesController from './stores.controller.js';
import { registerStoreSchema } from './stores.schema.js';

const router = Router();

/**
 * POST /api/v1/stores/register
 * Public endpoint for UMKM warung/warkop in Sidoarjo to register as a partner store.
 * Rate-limited to 10 registrations per minute per IP to prevent store spam.
 */
router.post(
  '/register',
  rateLimit({ prefix: 'rl:stores_register', max: 10, windowSeconds: 60 }),
  validate(registerStoreSchema),
  storesController.registerStore
);

export default router;
