import prisma from '../../config/database.js';
import { CACHE_KEYS, invalidateCache } from '../../config/redis.js';
import { AppError } from '../../utils/response.js';

/**
 * Registers a new partner store/warung in Sidoarjo.
 * Ensures unique phone number and invalidates KPI summary cache.
 */
export async function registerStore(payload) {
  const existingStore = await prisma.store.findUnique({
    where: { phone: payload.phone },
  });

  if (existingStore) {
    throw new AppError(
      `Phone number ${payload.phone} is already registered to store "${existingStore.name}"`,
      409,
      [{ field: 'phone', message: 'Phone number is already registered' }]
    );
  }

  const newStore = await prisma.store.create({
    data: {
      name: payload.name,
      ownerName: payload.ownerName,
      phone: payload.phone,
      district: payload.district,
      address: payload.address,
      isVerified: false,
    },
  });

  await invalidateCache(CACHE_KEYS.KPI_SUMMARY);

  return newStore;
}

