import crypto from 'node:crypto';
import { sendError } from '../utils/response.js';

/**
 * Single-Token Bearer Authentication Middleware for internal Admin dashboard routes.
 * Header format: Authorization: Bearer <ADMIN_SECRET_KEY>
 * Uses SHA-256 hashing prior to crypto.timingSafeEqual so token length is never leaked via timing side-channel.
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
      errors: [
        {
          field: 'Authorization',
          message: 'Expected header Authorization: Bearer <ADMIN_SECRET_KEY>',
        },
      ],
    });
  }

  const providedToken = authHeader.slice(7).trim();
  if (!providedToken) {
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized: Empty Bearer token',
      errors: [{ field: 'Authorization', message: 'Token cannot be empty' }],
    });
  }

  // Hash both sides with SHA-256 (always 32 bytes) to eliminate length timing leaks
  const providedDigest = crypto.createHash('sha256').update(providedToken, 'utf8').digest();
  const expectedDigest = crypto.createHash('sha256').update(expectedSecret, 'utf8').digest();

  if (!crypto.timingSafeEqual(providedDigest, expectedDigest)) {
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized: Invalid admin secret key',
      errors: [{ field: 'Authorization', message: 'Invalid Bearer token' }],
    });
  }

  return next();
}
