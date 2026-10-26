import redis from '../config/redis.js';
import { sendError } from '../utils/response.js';

/**
 * Extracts client IP address safely behind Vercel / reverse proxies.
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

// Fallback in-memory sliding window map when Redis is unavailable
const memoryBuckets = new Map();

/**
 * Stateless Rate Limiter Middleware backed by Upstash Redis (with in-memory fallback).
 * Fails open if Redis errors out so production traffic is never accidentally bricked.
 *
 * @param {Object} options
 * @param {string} options.prefix - Unique namespace per route (e.g. 'rl:orders_create')
 * @param {number} options.max - Max requests allowed within windowSeconds
 * @param {number} options.windowSeconds - Window duration in seconds
 */
export function rateLimit({ prefix, max = 30, windowSeconds = 60 }) {
  return async (req, res, next) => {
    // Bypass rate limiter during automated local test suites if explicitly set
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    const ip = getClientIp(req);
    const windowBucket = Math.floor(Date.now() / (windowSeconds * 1000));
    const key = `${prefix}:${ip}:${windowBucket}`;

    try {
      let currentCount = 1;

      if (redis) {
        currentCount = await redis.incr(key);
        if (currentCount === 1) {
          await redis.expire(key, windowSeconds);
        }
      } else {
        const now = Date.now();
        const entry = memoryBuckets.get(key) || {
          count: 0,
          expiresAt: now + windowSeconds * 1000,
        };
        if (now > entry.expiresAt) {
          entry.count = 0;
          entry.expiresAt = now + windowSeconds * 1000;
        }
        entry.count += 1;
        memoryBuckets.set(key, entry);
        currentCount = entry.count;
      }

      const remaining = Math.max(0, max - currentCount);
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(remaining));

      if (currentCount > max) {
        res.setHeader('Retry-After', String(windowSeconds));
        return sendError(res, {
          statusCode: 429,
          message: `Too many requests. Please wait ${windowSeconds} seconds before retrying.`,
          errors: [
            {
              field: 'rateLimit',
              message: `Rate limit exceeded (${max} requests per ${windowSeconds}s)`,
            },
          ],
        });
      }

      return next();
    } catch (err) {
      // Fail-open on unexpected Redis issues
      console.warn(`[RateLimit Warning] ${prefix} check failed:`, err.message);
      return next();
    }
  };
}

