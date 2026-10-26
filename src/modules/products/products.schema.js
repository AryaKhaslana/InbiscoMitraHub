import { z } from 'zod';

export const productsQuerySchema = z.object({
  category: z
    .string({ invalid_type_error: 'category must be a string' })
    .trim()
    .max(50, 'category filter must not exceed 50 characters')
    .optional(),
  search: z
    .string({ invalid_type_error: 'search must be a string' })
    .trim()
    .max(100, 'search query must not exceed 100 characters')
    .optional(),
});

