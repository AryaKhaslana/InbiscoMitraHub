import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

export const CACHE_KEYS = {
  CATALOG_PUBLIC: 'cache:catalog_public',
  KPI_SUMMARY: 'cache:kpi_summary',
};

export const CACHE_TTL = {
  CATALOG_PUBLIC: 3600, // 1 hour
  KPI_SUMMARY: 180,     // 3 minutes
};

const isRedisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('[endpoint]')
);

export const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Fail-open cache reader: returns null if Redis is unreachable or key does not exist.
 */
export async function getCache(key) {
  if (!redis) return null;
  try {
    const cached = await redis.get(key);
    return cached ?? null;
  } catch (err) {
    console.warn(`[Redis GET Warning] Key "${key}" failed, falling back to DB:`, err.message);
    return null;
  }
}

/**
 * Fail-open cache writer with TTL in seconds.
 */
export async function setCache(key, value, ttlSeconds) {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.warn(`[Redis SET Warning] Key "${key}" failed:`, err.message);
  }
}

/**
 * Fail-open cache invalidation for one or multiple keys.
 */
export async function invalidateCache(...keys) {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (err) {
    console.warn(`[Redis DEL Warning] Keys "${keys.join(', ')}" failed:`, err.message);
  }
}

export default redis;

