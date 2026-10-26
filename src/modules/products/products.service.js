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
 * Applies optional category & search filtering in-memory over the catalog array
 * so query parameters can never bypass the Redis cache (`cache:catalog_public`) to DoS PostgreSQL.
 */
function filterCatalogInMemory(catalog, { category, search }) {
  const now = new Date();
  let filtered = catalog.filter((p) => new Date(p.expiryDate) > now);

  if (category) {
    const catLower = category.toLowerCase();
    filtered = filtered.filter(
      (p) => p.category && p.category.toLowerCase() === catLower
    );
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }

  return filtered;
}

/**
 * Retrieves active, non-expired public product catalog.
 * Always reads from / populates Redis key `cache:catalog_public` (TTL 3600s)
 * and performs optional category/search filtering in memory.
 */
export async function getPublicCatalog({ category, search } = {}) {
  const cachedCatalog = await getCache(CACHE_KEYS.CATALOG_PUBLIC);
  if (Array.isArray(cachedCatalog)) {
    return {
      products: filterCatalogInMemory(cachedCatalog, { category, search }),
      cacheHit: true,
    };
  }

  const now = new Date();
  const rawProducts = await prisma.product.findMany({
    where: {
      isAvailable: true,
      expiryDate: { gt: now },
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  const allActiveProducts = rawProducts.map(serializeProduct);

  await setCache(
    CACHE_KEYS.CATALOG_PUBLIC,
    allActiveProducts,
    CACHE_TTL.CATALOG_PUBLIC
  );

  return {
    products: filterCatalogInMemory(allActiveProducts, { category, search }),
    cacheHit: false,
  };
}
