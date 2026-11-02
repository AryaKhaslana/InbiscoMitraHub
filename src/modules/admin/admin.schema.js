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
  paymentMethod: z.enum(['COD', 'TEMPO_7_DAYS']).optional(),
  search: z.string().trim().max(100).optional(),
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
    note: z.string().trim().max(250).optional(),
  })
  .strict();

export const idParamSchema = z.object({
  id: z.string().trim().min(2, 'Parameter id is required').max(100),
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
  entityType: z
    .enum([
      'ORDER',
      'STORE',
      'PRODUCT',
      'SIMULATION',
      'TRANSFER',
      'PURCHASE_ORDER',
      'INBOUND_DO',
      'AUTH',
    ])
    .optional(),
  entityId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const portalLoginSchema = z
  .object({
    username: z.string().trim().min(2, 'Username or email is required').max(120),
    password: z.string().min(1, 'Password is required').max(200),
    role: z.enum(['HQ_ADMIN', 'DISTRIBUTOR_DEPO']).optional(),
  })
  .strict();

export const dailySalesInputSchema = z
  .object({
    productId: z.string().uuid('productId must be a valid UUID').optional(),
    sku: z.string().trim().min(2).max(50).optional(),
    quantityCartons: z.coerce
      .number({ required_error: 'quantityCartons is required' })
      .int('quantityCartons must be an integer')
      .min(1, 'quantityCartons must be at least 1 carton')
      .max(10000, 'quantityCartons cannot exceed 10000 per entry'),
    channel: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .default('Grosir Warung & Warkop'),
    storeName: z.string().trim().max(120).optional(),
    operatorName: z.string().trim().max(100).default('Bambang Sudiro'),
    notes: z.string().trim().max(250).optional(),
  })
  .strict()
  .refine((data) => Boolean(data.productId || data.sku), {
    message: 'Either productId or sku must be provided',
  });

export const dailySalesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const whatIfSimulationSchema = z
  .object({
    productId: z.string().uuid().optional(),
    sku: z.string().trim().max(50).optional(),
    stockOnHand: z.coerce.number().int().min(0).max(500000).default(280),
    ads: z.coerce.number().positive().max(100000).default(175),
    baseAds: z.coerce.number().positive().max(100000).default(140),
    demandSpikePct: z.coerce.number().min(-90).max(500).optional(),
    leadTimeDays: z.coerce.number().int().min(1).max(60).default(3),
    safetyStock: z.coerce.number().int().min(0).max(100000).default(200),
    proposedRestockQty: z.coerce.number().int().min(0).max(100000).default(850),
    unitPrice: z.coerce.number().positive().max(999999999).default(137500),
    dispatchMode: z.enum(['SINGLE', 'SPLIT']).default('SINGLE'),
  })
  .strict();

export const crossDepotTransferSchema = z
  .object({
    productId: z.string().uuid().optional(),
    sku: z.string().trim().min(2).max(50).optional(),
    sourceDepot: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .default('Depo Mojokerto (Hub Jatim 2)'),
    targetDepot: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .default('CV Surya Krian Logistik (Hub Jatim 1)'),
    quantityCartons: z.coerce
      .number({ required_error: 'quantityCartons is required' })
      .int()
      .min(1, 'quantityCartons must be at least 1 carton')
      .max(50000),
    notes: z.string().trim().max(250).optional(),
  })
  .strict()
  .refine((data) => Boolean(data.productId || data.sku), {
    message: 'Either productId or sku must be provided',
  });

export const batchApprovePoSchema = z
  .object({
    depotName: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .default('CV Surya Krian Logistik'),
    targetPlant: z.string().trim().max(120).optional(),
    priority: z.string().trim().max(60).optional(),
    applyToStock: z.boolean().default(false),
    notes: z.string().trim().max(250).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid().optional(),
          sku: z.string().trim().min(2).max(50).optional(),
          quantityCartons: z.coerce.number().int().min(1).max(50000),
        })
      )
      .min(1, 'At least 1 PO item is required')
      .max(50),
  })
  .strict();

export const doNumberParamSchema = z.object({
  doNumber: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[A-Za-z0-9-]+$/, 'Invalid DO number format'),
});

export const confirmInboundDeliverySchema = z
  .object({
    receivedBy: z.string().trim().min(2).max(100).default('Bambang Sudiro (Kepala Gudang Krian)'),
    sealCode: z.string().trim().max(50).default('MYR-998240'),
    notes: z.string().trim().max(250).optional(),
    applyToStock: z.boolean().default(true),
  })
  .strict();

