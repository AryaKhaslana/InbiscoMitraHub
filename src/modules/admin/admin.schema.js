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
  district: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ['CONFIRMED', 'PACKING', 'DISPATCHED', 'COMPLETED', 'CANCELLED'],
    {
      errorMap: () => ({
        message:
          'status must be one of CONFIRMED, PACKING, DISPATCHED, COMPLETED, CANCELLED',
      }),
    }
  ),
});

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
});

export const verifyStoreBodySchema = z
  .object({
    isVerified: z.boolean().optional(),
  })
  .optional();

export const createProductSchema = z.object({
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
    .positive('cartonPrice must be greater than 0'),
  retailPriceEst: z.coerce
    .number({ required_error: 'retailPriceEst is required' })
    .positive('retailPriceEst must be greater than 0'),
  stockCartons: z.coerce
    .number()
    .int('stockCartons must be an integer')
    .min(0, 'stockCartons cannot be negative')
    .default(0),
  batchNumber: z
    .string({ required_error: 'batchNumber is required' })
    .trim()
    .min(2, 'batchNumber is required'),
  expiryDate: z.coerce.date({
    required_error: 'expiryDate is required',
    invalid_type_error: 'expiryDate must be a valid ISO date string',
  }),
  imageUrl: z.string().url('imageUrl must be a valid URL').optional().nullable(),
  isAvailable: z.boolean().default(true),
});

export const updateProductStockSchema = z
  .object({
    stockCartons: z.coerce
      .number()
      .int('stockCartons must be an integer')
      .min(0, 'stockCartons cannot be negative')
      .optional(),
    addCartons: z.coerce
      .number()
      .int('addCartons must be an integer')
      .optional(),
    cartonPrice: z.coerce
      .number()
      .positive('cartonPrice must be greater than 0')
      .optional(),
    retailPriceEst: z.coerce
      .number()
      .positive('retailPriceEst must be greater than 0')
      .optional(),
    batchNumber: z.string().trim().min(2).optional(),
    expiryDate: z.coerce.date().optional(),
    isAvailable: z.boolean().optional(),
  })
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

