import crypto from 'node:crypto';
import { sendError } from '../utils/response.js';

/**
 * Generates an HMAC-SHA256 session token scoped to a portal role so raw ADMIN_SECRET_KEY is never exposed in login responses.
 */
export function createSessionToken(role = 'DISTRIBUTOR_DEPO', secret = process.env.ADMIN_SECRET_KEY) {
  const normalizedRole = role === 'HQ_ADMIN' ? 'HQ_ADMIN' : 'DISTRIBUTOR_DEPO';
  const sig = crypto
    .createHmac('sha256', String(secret || ''))
    .update(`inbisco_portal_session:${normalizedRole}`)
    .digest('hex');
  return `inb_sess_${normalizedRole}_${sig}`;
}

function safeCompareStrings(a, b) {
  const digestA = crypto.createHash('sha256').update(String(a), 'utf8').digest();
  const digestB = crypto.createHash('sha256').update(String(b), 'utf8').digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

/**
 * Single-Token / Session Bearer Authentication Middleware for internal Admin & Distributor routes.
 * Accepts either raw Bearer <ADMIN_SECRET_KEY> or a signed portal token from POST /api/v1/auth/login.
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

  const isMasterKey = safeCompareStrings(providedToken, expectedSecret);
  const isHqSession = safeCompareStrings(providedToken, createSessionToken('HQ_ADMIN', expectedSecret));
  const isDepoSession = safeCompareStrings(providedToken, createSessionToken('DISTRIBUTOR_DEPO', expectedSecret));

  if (!isMasterKey && !isHqSession && !isDepoSession) {
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized: Invalid admin secret key',
      errors: [{ field: 'Authorization', message: 'Invalid Bearer token' }],
    });
  }

  req.adminRole = isDepoSession ? 'DISTRIBUTOR_DEPO' : 'HQ_ADMIN';
  return next();
}

