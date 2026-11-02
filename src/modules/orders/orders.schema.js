import { z } from 'zod';

export const createOrderSchema = z.object({
  storeId: z
    .string()
    .uuid('storeId must be a valid UUID')
    .optional(),
  storePhone: z
    .string()
    .optional(),
  storeName: z
    .string()
    .optional(),
  paymentMethod: z
    .string()
    .default('COD')
    .transform((val) => {
      const upper = (val || '').toUpperCase();
      if (upper === 'CASH_ON_DELIVERY' || upper === 'COD') return 'COD';
      if (upper === 'TOP_14_DAYS' || upper === 'TOP_7_DAYS' || upper === 'TEMPO_7_DAYS' || upper === 'TEMPO') return 'TEMPO_7_DAYS';
      return 'COD';
    }),
  notes: z
    .string()
    .transform((val) => val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim())
    .pipe(z.string().max(500, 'Notes must not exceed 500 characters'))
    .optional(),
  items: z
    .array(
      z
        .object({
          productId: z
            .string({ required_error: 'productId is required' })
            .uuid('productId must be a valid UUID'),
          quantity: z
            .number({ required_error: 'quantity is required' })
            .int('quantity must be an integer (in cartons)')
            .positive('quantity must be at least 1 carton')
            .max(1000, 'quantity per item must not exceed 1000 cartons'),
        })
        .passthrough()
    )
    .min(1, 'Order must contain at least 1 item')
    .max(50, 'Order cannot contain more than 50 distinct items'),
}).passthrough();

export const trackOrderParamsSchema = z.object({
  code: z
    .string({ required_error: 'Tracking code is required' })
    .trim()
    .min(5, 'Invalid tracking code format')
    .max(30, 'Invalid tracking code format')
    .transform((val) => val.toUpperCase()),
});
