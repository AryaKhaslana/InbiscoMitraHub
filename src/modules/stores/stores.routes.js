import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import * as storesController from './stores.controller.js';
import { registerStoreSchema } from './stores.schema.js';

const router = Router();

/**
 * POST /api/v1/stores/register
 * Public endpoint for UMKM warung/warkop in Sidoarjo to register as a partner store.
 */
router.post('/register', validate(registerStoreSchema), storesController.registerStore);

export default router;

