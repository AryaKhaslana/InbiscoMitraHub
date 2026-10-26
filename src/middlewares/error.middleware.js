import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/response.js';

/**
 * 404 Not Found Handler for unmatched routes.
 */
export function notFoundHandler(req, res) {
  return sendError(res, {
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errors: [{ path: req.originalUrl, method: req.method }],
  });
}

/**
 * Global Centralized Error Handling Middleware.
 */
export function errorHandler(err, req, res, _next) {
  // Handle malformed JSON body from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, {
      statusCode: 400,
      message: 'Malformed JSON in request body',
      errors: [{ field: 'body', message: 'Invalid JSON syntax' }],
    });
  }

  // Handle payload too large from express.json({ limit })
  if (err?.type === 'entity.too.large') {
    return sendError(res, {
      statusCode: 413,
      message: 'Request payload is too large',
      errors: [{ field: 'body', message: 'Payload exceeds maximum allowed size' }],
    });
  }

  if (err instanceof AppError) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof ZodError) {
    return sendError(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors: err.errors.map((issue) => ({
        field: issue.path.join('.') || 'payload',
        message: issue.message,
      })),
    });
  }

  // Handle Prisma unique constraint violation (P2002)
  if (err?.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    return sendError(res, {
      statusCode: 409,
      message: `Duplicate value for unique constraint: ${target}`,
      errors: [{ field: target, message: `${target} already exists` }],
    });
  }

  // Handle Prisma record not found (P2025)
  if (err?.code === 'P2025') {
    return sendError(res, {
      statusCode: 404,
      message: 'Requested record was not found',
      errors: [{ message: err.meta?.cause || 'Record not found in database' }],
    });
  }

  console.error('[Unhandled Server Error]:', err);

  // Never leak internal error messages or stack traces in HTTP responses
  return sendError(res, {
    statusCode: 500,
    message: 'Internal Server Error',
    errors: [],
  });
}
