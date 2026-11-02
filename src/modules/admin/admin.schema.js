import { z } from 'zod';
import { SIDOARJO_DISTRICTS } from '../stores/stores.schema.js';

export const adminOrdersQuerySchema = z.object({
  status: z
    .enum([
      'PENDING',
      'CONFIRMED',
      'PACKING',
      'DISPATCHED',
      'COMPLETED',
      'CANCELLED',
    ])
    .optional(),
  district: z
    .string()
    .trim()
    .refine(
      (val) =>
        !val ||
        SIDOARJO_DISTRICTS.some(
          (d) => d.toLowerCase() === val.toLowerCase()
        ),
      {
        message: 'Invalid Sidoarjo district filter',
      }
    )
    .optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(
      ['CONFIRMED', 'PACKING', 'DISPATCHED', 'COMPLETED', 'CANCELLED'],
      {
        errorMap: () => ({
          message:
            'status must be one of CONFIRMED, PACKING, DISPATCHED, COMPLETED, CANCELLED',
        }),
      }
    ),
  })
  .strict();

export const idParamSchema = z.object({
  id: z.string().uuid('Parameter id must be a valid UUID'),
});

export const adminStoresQuerySchema = z.object({
  verified: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  district: z
    .string()
    .trim()
    .refine(
      (val) =>
        !val ||
        SIDOARJO_DISTRICTS.some(
          (d) => d.toLowerCase() === val.toLowerCase()
        ),
      {
        message: 'Invalid Sidoarjo district filter',
      }
    )
    .optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const verifyStoreBodySchema = z
  .object({
    isVerified: z.boolean({
      required_error: 'isVerified (boolean) is required in request body',
      invalid_type_error: 'isVerified must be a boolean (true or false)',
    }),
  })
  .strict();

/**
 * Validates that a URL strictly uses http:// or https:// protocol (blocks javascript:, data:, file:, etc.)
 */
function isSafeHttpUrl(val) {
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const createProductSchema = z
  .object({
    sku: z
      .string({ required_error: 'SKU is required' })
      .trim()
      .min(3, 'SKU must be at least 3 characters')
      .max(50, 'SKU must not exceed 50 characters')
      .transform((val) => val.toUpperCase()),
    name: z
      .string({ required_error: 'Product name is required' })
      .trim()
      .min(3, 'Product name must be at least 3 characters')
      .max(150, 'Product name must not exceed 150 characters'),
    category: z
      .string({ required_error: 'Category is required' })
      .trim()
      .min(2, 'Category must be at least 2 characters'),
    cartonPrice: z.coerce
      .number({ required_error: 'cartonPrice is required' })
      .positive('cartonPrice must be greater than 0')
      .max(999999999, 'cartonPrice exceeds maximum allowed value'),
    retailPriceEst: z.coerce
      .number({ required_error: 'retailPriceEst is required' })
      .positive('retailPriceEst must be greater than 0')
      .max(999999999, 'retailPriceEst exceeds maximum allowed value'),
    stockCartons: z.coerce
      .number()
      .int('stockCartons must be an integer')
      .min(0, 'stockCartons cannot be negative')
      .max(1000000, 'stockCartons exceeds maximum warehouse capacity')
      .default(0),
    batchNumber: z
      .string({ required_error: 'batchNumber is required' })
      .trim()
      .min(2, 'batchNumber is required')
      .max(50, 'batchNumber must not exceed 50 characters'),
    expiryDate: z.coerce.date({
      required_error: 'expiryDate is required',
      invalid_type_error: 'expiryDate must be a valid ISO date string',
    }),
    imageUrl: z
      .string()
      .trim()
      .url('imageUrl must be a valid URL')
      .refine(isSafeHttpUrl, {
        message: 'imageUrl must use http:// or https:// protocol',
      })
      .optional()
      .nullable(),
    isAvailable: z.boolean().default(true),
  })
  .strict();

export const updateProductStockSchema = z
  .object({
    stockCartons: z.coerce
      .number()
      .int('stockCartons must be an integer')
      .min(0, 'stockCartons cannot be negative')
      .max(1000000, 'stockCartons exceeds maximum warehouse capacity')
      .optional(),
    addCartons: z.coerce
      .number()
      .int('addCartons must be an integer')
      .min(-1000000, 'addCartons out of bounds')
      .max(1000000, 'addCartons out of bounds')
      .optional(),
    cartonPrice: z.coerce
      .number()
      .positive('cartonPrice must be greater than 0')
      .max(999999999, 'cartonPrice exceeds maximum allowed value')
      .optional(),
    retailPriceEst: z.coerce
      .number()
      .positive('retailPriceEst must be greater than 0')
      .max(999999999, 'retailPriceEst exceeds maximum allowed value')
      .optional(),
    batchNumber: z.string().trim().min(2).max(50).optional(),
    expiryDate: z.coerce.date().optional(),
    isAvailable: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      !(data.stockCartons !== undefined && data.addCartons !== undefined),
    {
      message: 'Provide either stockCartons (absolute) or addCartons (relative), not both',
    }
  )
  .refine(
    (data) =>
      data.stockCartons !== undefined ||
      data.addCartons !== undefined ||
      data.cartonPrice !== undefined ||
      data.retailPriceEst !== undefined ||
      data.batchNumber !== undefined ||
      data.expiryDate !== undefined ||
      data.isAvailable !== undefined,
    {
      message: 'At least one field must be provided to update product/stock',
    }
  );

export const adminAuditLogsQuerySchema = z.object({
  action: z.string().trim().optional(),
  entityType: z.enum(['ORDER', 'STORE', 'PRODUCT']).optional(),
  entityId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
