import { redis } from '../config/redis.js';

// Fallback in-memory circular logs if Redis is temporarily unreachable
const MEMORY_LOG_LIMIT = 200;
const inMemoryLogs = [];
const inMemoryJuryLogs = [];
const uniqueIps = new Set();

/**
 * Extracts true client IP address behind Vercel / Cloudflare edge proxies.
 */
function extractIp(req) {
  const vercelIp = req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'];
  if (typeof vercelIp === 'string' && vercelIp.length > 0) {
    return vercelIp.split(',')[0].trim();
  }
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

/**
 * Checks if a request is an automated warm-up cron or devops dashboard poll.
 */
function classifyTraffic(path, userAgent, ip) {
  const lowerAgent = (userAgent || '').toLowerCase();
  const isHealth = path === '/api/v1/health' || path === '/';
  const isCronAgent =
    lowerAgent.includes('cron') ||
    lowerAgent.includes('vercel-cron') ||
    lowerAgent.includes('github-actions') ||
    lowerAgent.includes('uptime') ||
    lowerAgent.includes('pingdom');
  const isDevops = path.startsWith('/devops') || path.startsWith('/api/v1/devops');

  if (isDevops) {
    return { type: 'DEVOPS_ADMIN', isJury: false };
  }
  if (isHealth && isCronAgent) {
    return { type: 'CRON_WARMUP', isJury: false };
  }
  if (isHealth && !lowerAgent.includes('mozilla')) {
    return { type: 'HEALTH_CHECK', isJury: false };
  }
  return { type: 'POTENTIAL_JURI', isJury: true };
}

/**
 * Express Middleware: Captures all incoming HTTP requests and streams structured logs
 * to Upstash Redis and in-memory ring buffers.
 */
export function auditTracker(req, res, next) {
  const startHrTime = process.hrtime();
  const startTime = Date.now();
  const path = req.originalUrl || req.url || '/';

  // Ignore static assets / favicons to keep logs focused on meaningful API & page traffic
  if (path === '/favicon.ico' || path.endsWith('.map')) {
    return next();
  }

  res.on('finish', async () => {
    try {
      const hrDiff = process.hrtime(startHrTime);
      const durationMs = Number((hrDiff[0] * 1000 + hrDiff[1] / 1e6).toFixed(2));
      const ip = extractIp(req);
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const country = req.headers['x-vercel-ip-country'] || 'ID';
      const city = req.headers['x-vercel-ip-city'] || 'Local/Unknown';
      const region = req.headers['x-vercel-ip-country-region'] || '-';

      const { type, isJury } = classifyTraffic(path, userAgent, ip);

      // WIB Timestamp (UTC+7)
      const now = new Date(startTime);
      const wibTimeString = now.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB';

      const logEntry = {
        id: `req_${startTime}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: now.toISOString(),
        timeWIB: wibTimeString,
        ip,
        country,
        city,
        region,
        method: req.method,
        path,
        statusCode: res.statusCode,
        durationMs,
        userAgent,
        type,
        isJury,
      };

      // Store in memory ring buffer
      inMemoryLogs.unshift(logEntry);
      if (inMemoryLogs.length > MEMORY_LOG_LIMIT) inMemoryLogs.pop();
      uniqueIps.add(ip);

      if (isJury) {
        inMemoryJuryLogs.unshift(logEntry);
        if (inMemoryJuryLogs.length > MEMORY_LOG_LIMIT) inMemoryJuryLogs.pop();
      }

      // Persist to Upstash Redis asynchronously (non-blocking)
      if (redis) {
        const payload = JSON.stringify(logEntry);
        await Promise.allSettled([
          redis.lpush('devops:audit_logs', payload),
          redis.ltrim('devops:audit_logs', 0, 499),
          isJury ? redis.lpush('devops:jury_logs', payload) : Promise.resolve(),
          isJury ? redis.ltrim('devops:jury_logs', 0, 199) : Promise.resolve(),
          redis.sadd('devops:unique_ips', ip),
          redis.hincrby('devops:stats', 'total_requests', 1),
          isJury ? redis.hincrby('devops:stats', 'jury_requests', 1) : Promise.resolve(),
          isJury ? redis.hset('devops:stats', { last_jury_active: now.toISOString() }) : Promise.resolve(),
        ]);
      }
    } catch (err) {
      // Never crash or fail a client response due to logging errors
      console.error('[Audit Tracker Error]:', err.message);
    }
  });

  next();
}

/**
 * Retrieves audit logs and summary metrics from Redis or Memory.
 */
export async function getAuditData() {
  if (redis) {
    try {
      const [rawLogs, rawJury, rawStats, totalIps] = await Promise.all([
        redis.lrange('devops:audit_logs', 0, 99),
        redis.lrange('devops:jury_logs', 0, 49),
        redis.hgetall('devops:stats'),
        redis.scard('devops:unique_ips'),
      ]);

      const logs = (rawLogs || []).map((item) => (typeof item === 'string' ? JSON.parse(item) : item));
      const juryLogs = (rawJury || []).map((item) => (typeof item === 'string' ? JSON.parse(item) : item));

      return {
        source: 'redis',
        stats: {
          totalRequests: Number(rawStats?.total_requests) || logs.length,
          juryRequests: Number(rawStats?.jury_requests) || juryLogs.length,
          uniqueVisitors: Number(totalIps) || uniqueIps.size,
          lastJuryActive: rawStats?.last_jury_active || (juryLogs[0] ? juryLogs[0].timestamp : null),
        },
        juryLogs,
        allLogs: logs,
      };
    } catch (err) {
      console.warn('[Audit Data] Redis query error, using in-memory data:', err.message);
    }
  }

  return {
    source: 'in-memory',
    stats: {
      totalRequests: inMemoryLogs.length,
      juryRequests: inMemoryJuryLogs.length,
      uniqueVisitors: uniqueIps.size,
      lastJuryActive: inMemoryJuryLogs[0]?.timestamp || null,
    },
    juryLogs: inMemoryJuryLogs,
    allLogs: inMemoryLogs,
  };
}

/**
 * Clears audit logs (Admin only)
 */
export async function clearAuditLogs() {
  inMemoryLogs.length = 0;
  inMemoryJuryLogs.length = 0;
  uniqueIps.clear();

  if (redis) {
    try {
      await redis.del('devops:audit_logs', 'devops:jury_logs', 'devops:unique_ips', 'devops:stats');
    } catch (err) {
      console.warn('[Audit Clear] Redis del error:', err.message);
    }
  }
}
