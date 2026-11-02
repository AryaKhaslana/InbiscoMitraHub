import redis from '../config/redis.js';
import { sendError } from '../utils/response.js';

/**
 * Extracts client IP address securely.
 * - On Vercel (`process.env.VERCEL` is truthy), Vercel Edge overwrites `x-vercel-forwarded-for`
 *   and `x-real-ip` with the true connecting client IP, preventing client header spoofing.
 * - Outside Vercel (local dev / direct server), we NEVER trust client-supplied `x-forwarded-for`
 *   unless `TRUST_PROXY_HEADERS=true` is explicitly configured, using `req.socket.remoteAddress` instead.
 */
export function getClientIp(req) {
  const isVercel = Boolean(process.env.VERCEL);

  if (isVercel) {
    const vercelIp = req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'];
    if (typeof vercelIp === 'string' && vercelIp.length > 0) {
      return vercelIp.split(',')[0].trim();
    }
  }

  if (process.env.TRUST_PROXY_HEADERS === 'true') {
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.length > 0) {
      return realIp.trim();
    }
  }

  return req.socket?.remoteAddress || req.ip || 'unknown';
}

// Fallback in-memory sliding window map when Redis is unavailable
const memoryBuckets = new Map();

/**
 * Stateless Rate Limiter Middleware backed by Upstash Redis (with in-memory fallback).
 * Uses true sliding-ttl per IP (`prefix:ip` with `EXPIRE` on first hit) so burst attacks
 * cannot reset their quota across clock-minute boundaries.
 *
 * @param {Object} options
 * @param {string} options.prefix - Unique namespace per route (e.g. 'rl:orders_create')
 * @param {number} options.max - Max requests allowed within windowSeconds
 * @param {number} options.windowSeconds - Window duration in seconds
 */
export function rateLimit({ prefix, max = 30, windowSeconds = 60 }) {
  return async (req, res, next) => {
    // Bypass rate limiter during automated local test suites (never in production)
    if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    const ip = getClientIp(req);
    const key = `${prefix}:${ip}`;

    try {
      let currentCount = 1;

      if (redis) {
        const pipe = redis.pipeline();
        pipe.incr(key);
        pipe.expire(key, windowSeconds, 'NX');
        const [incrCount] = await pipe.exec();
        currentCount = Number(incrCount) || 1;
      } else {
        const now = Date.now();
        if (memoryBuckets.size > 5000) memoryBuckets.clear();
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
