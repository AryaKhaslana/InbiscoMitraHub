import prisma from '../../config/database.js';
import {
  CACHE_KEYS,
  CACHE_TTL,
  getCache,
  setCache,
} from '../../config/redis.js';

/**
 * Formats Prisma Decimal fields to numbers for clean JSON responses.
 */
export function serializeProduct(product) {
  const cartonPrice = Number(product.cartonPrice);
  const retailPriceEst = Number(product.retailPriceEst);
  const estimatedMarginPerCarton = Math.max(0, retailPriceEst - cartonPrice);
  const estimatedMarginPercent =
    cartonPrice > 0
      ? Number(((estimatedMarginPerCarton / cartonPrice) * 100).toFixed(2))
      : 0;

  return {
    ...product,
    cartonPrice,
    retailPriceEst,
    estimatedMarginPerCarton,
    estimatedMarginPercent,
  };
}

/**
 * Retrieves active public product catalog.
 * Reads from Redis key `cache:catalog_public` (TTL 3600s) when no custom filter is applied.
 */
export async function getPublicCatalog({ category, search } = {}) {
  const isUnfiltered = !category && !search;

  if (isUnfiltered) {
    const cachedCatalog = await getCache(CACHE_KEYS.CATALOG_PUBLIC);
    if (cachedCatalog) {
      return {
        products: cachedCatalog,
        cacheHit: true,
      };
    }
  }

  const where = {
    isAvailable: true,
  };

  if (category) {
    where.category = {
      equals: category,
      mode: 'insensitive',
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  const rawProducts = await prisma.product.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  const products = rawProducts.map(serializeProduct);

  if (isUnfiltered) {
    await setCache(CACHE_KEYS.CATALOG_PUBLIC, products, CACHE_TTL.CATALOG_PUBLIC);
  }

  return {
    products,
    cacheHit: false,
  };
}

