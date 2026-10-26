import prisma from '../../config/database.js';
import { AppError } from '../../utils/response.js';

/**
 * Registers a new partner store/warung in Sidoarjo.
 * - Does NOT leak existing store names when a duplicate phone number is submitted (prevents user/store enumeration).
 * - Does NOT invalidate `cache:kpi_summary` because newly registered stores start as `isVerified: false`,
 *   preventing public registration spam from busting the admin KPI cache.
 */
export async function registerStore(payload) {
  const existingStore = await prisma.store.findUnique({
    where: { phone: payload.phone },
    select: { id: true },
  });

  if (existingStore) {
    throw new AppError(
      'Phone number is already registered to an existing partner store',
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

  return newStore;
}

/**
 * Looks up a partner store by normalized phone number so returning warung owners
 * can retrieve their `storeId` and verification status for checkout.
 * Redacts full street address & ownerName to protect PII.
 */
export async function lookupStoreByPhone(phone) {
  const store = await prisma.store.findUnique({
    where: { phone },
    select: {
      id: true,
      name: true,
      district: true,
      isVerified: true,
    },
  });

  if (!store) {
    throw new AppError('No partner store found with that phone number', 404, [
      { field: 'phone', message: 'Store not registered' },
    ]);
  }

  return store;
}
