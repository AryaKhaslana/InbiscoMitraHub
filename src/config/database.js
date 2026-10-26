import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Global singleton pattern for PrismaClient to prevent connection pool exhaustion
 * across warm invocations in Vercel Serverless Functions.
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

