import crypto from 'node:crypto';
import { sendError } from '../utils/response.js';

/**
 * Single-Token Bearer Authentication Middleware for internal Admin dashboard routes.
 * Header format: Authorization: Bearer <ADMIN_SECRET_KEY>
 */
export function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.ADMIN_SECRET_KEY;

  if (!expectedSecret) {
    return sendError(res, {
      statusCode: 500,
      message: 'Server authentication configuration is missing (ADMIN_SECRET_KEY)',
      errors: [{ field: 'server', message: 'ADMIN_SECRET_KEY is not configured' }],
    });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized: Missing or malformed Bearer token',
      errors: [{ field: 'Authorization', message: 'Expected header Authorization: Bearer <ADMIN_SECRET_KEY>' }],
    });
  }

  const providedToken = authHeader.slice(7).trim();

  const providedBuf = Buffer.from(providedToken, 'utf8');
  const expectedBuf = Buffer.from(expectedSecret, 'utf8');

  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized: Invalid admin secret key',
      errors: [{ field: 'Authorization', message: 'Invalid Bearer token' }],
    });
  }

  return next();
}

