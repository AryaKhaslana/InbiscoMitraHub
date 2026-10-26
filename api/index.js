import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import {
  errorHandler,
  notFoundHandler,
} from '../src/middlewares/error.middleware.js';
import { rateLimit } from '../src/middlewares/rateLimit.middleware.js';
import adminRoutes from '../src/modules/admin/admin.routes.js';
import ordersRoutes from '../src/modules/orders/orders.routes.js';
import productsRoutes from '../src/modules/products/products.routes.js';
import storesRoutes from '../src/modules/stores/stores.routes.js';
import { sendSuccess } from '../src/utils/response.js';

dotenv.config();

const app = express();

// Only enable Express proxy trust when running behind Vercel Edge or explicit reverse proxy
if (process.env.VERCEL || process.env.TRUST_PROXY_HEADERS === 'true') {
  app.set('trust proxy', 1);
}

// Security & HTTP headers
app.use(helmet());

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request parsing & logging (100kb max body size to prevent JSON memory exhaustion DoS)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/**
 * Root informational route
 */
app.get(
  '/',
  rateLimit({ prefix: 'rl:health', max: 120, windowSeconds: 60 }),
  (_req, res) => {
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Inbisco MitraHub Backend API Engine is running',
      data: {
        service: 'Inbisco MitraHub API',
        version: '1.0.0',
        documentation: '/api/v1/health',
      },
    });
  }
);

/**
 * GET /api/v1/health
 * Keep Vercel Serverless instance warm via cron-job.
 * Does not leak process.uptime() or NODE_ENV details to public callers.
 */
app.get(
  '/api/v1/health',
  rateLimit({ prefix: 'rl:health', max: 120, windowSeconds: 60 }),
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message: 'Inbisco MitraHub service is healthy',
      status: 'ok',
      timestamp: new Date().toISOString(),
      data: {
        status: 'ok',
      },
    });
  }
);

/**
 * API v1 Module Routes
 */
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/stores', storesRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 & Global Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start standalone HTTP server when running locally (not inside Vercel serverless runtime)
const isVercel = Boolean(process.env.VERCEL);
if (!isVercel) {
  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(
      `🚀 [Inbisco MitraHub] Backend API running on http://localhost:${PORT} (${
        process.env.NODE_ENV || 'development'
      })`
    );
  });
}

export default app;

