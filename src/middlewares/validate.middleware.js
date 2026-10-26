import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * Middleware factory for validating req.body, req.query, and/or req.params with Zod schemas.
 * Usage: validate({ body: schema, query: querySchema, params: paramsSchema })
 * Or pass a single ZodObject directly to validate req.body.
 */
export function validate(schemas) {
  return (req, res, next) => {
    try {
      const isDirectSchema = typeof schemas?.safeParse === 'function';

      if (isDirectSchema) {
        req.body = schemas.parse(req.body);
        return next();
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((issue) => ({
          field: issue.path.join('.') || 'payload',
          message: issue.message,
        }));

        return sendError(res, {
          statusCode: 400,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      return next(error);
    }
  };
}

