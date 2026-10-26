import { z } from 'zod';

export const createOrderSchema = z.object({
  storeId: z
    .string({ required_error: 'storeId is required' })
    .uuid('storeId must be a valid UUID'),
  paymentMethod: z
    .enum(['COD', 'TEMPO_7_DAYS'], {
      errorMap: () => ({ message: 'paymentMethod must be either COD or TEMPO_7_DAYS' }),
    })
    .default('COD'),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
  items: z
    .array(
      z.object({
        productId: z
          .string({ required_error: 'productId is required' })
          .uuid('productId must be a valid UUID'),
        quantity: z
          .number({ required_error: 'quantity is required' })
          .int('quantity must be an integer (in cartons)')
          .positive('quantity must be at least 1 carton')
          .max(1000, 'quantity per item must not exceed 1000 cartons'),
      })
    )
    .min(1, 'Order must contain at least 1 item')
    .max(50, 'Order cannot contain more than 50 distinct items'),
});

export const trackOrderParamsSchema = z.object({
  code: z
    .string({ required_error: 'Tracking code is required' })
    .trim()
    .min(5, 'Invalid tracking code format')
    .max(30, 'Invalid tracking code format')
    .transform((val) => val.toUpperCase()),
});
