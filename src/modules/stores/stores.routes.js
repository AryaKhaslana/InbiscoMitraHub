import { Router } from 'express';
import { rateLimit } from '../../middlewares/rateLimit.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as storesController from './stores.controller.js';
import {
  contactInquirySchema,
  lookupStoreSchema,
  registerStoreSchema,
} from './stores.schema.js';

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

/**
 * POST /api/v1/stores/contact
 * Public endpoint for partnership inquiries and general support messages.
 */
router.post(
  '/contact',
  rateLimit({ prefix: 'rl:contact_inquiry', max: 10, windowSeconds: 60 }),
  validate(contactInquirySchema),
  storesController.submitContactInquiry
);

/**
 * POST /api/v1/stores/lookup
 * Public endpoint for returning partner stores to look up their storeId & verification status by phone number.
 * Strictly rate-limited to 10 requests per minute per IP.
 */
router.post(
  '/lookup',
  rateLimit({ prefix: 'rl:stores_lookup', max: 10, windowSeconds: 60 }),
  validate(lookupStoreSchema),
  storesController.lookupStore
);

export default router;
