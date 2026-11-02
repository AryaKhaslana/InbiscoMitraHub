import prisma from '../../config/database.js';
import {
  CACHE_KEYS,
  CACHE_TTL,
  getCache,
  invalidateCache,
  setCache,
} from '../../config/redis.js';
import { AppError } from '../../utils/response.js';
import { serializeOrder } from '../orders/orders.service.js';
import { serializeProduct } from '../products/products.service.js';

/**
 * Strict Single-Direction Order State Machine per PRD Section 7:
 * Allowed forward: PENDING -> CONFIRMED -> PACKING -> DISPATCHED -> COMPLETED
 * Allowed cancel:  PENDING -> CANCELLED, CONFIRMED -> CANCELLED
 * Prohibited: Jumping states or mutating COMPLETED / CANCELLED
 */
export const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKING', 'CANCELLED'],
  PACKING: ['DISPATCHED'],
  DISPATCHED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * GET /api/v1/admin/kpi
 * Computes 4 core KPI metrics + fastMovingProducts.
 * Cached in Upstash Redis under `cache:kpi_summary` (TTL 180s).
 */
export async function getKpiSummary() {
  const cachedKpi = await getCache(CACHE_KEYS.KPI_SUMMARY);
  if (cachedKpi) {
    return {
      kpi: cachedKpi,
      cacheHit: true,
    };
  }

  // Compute start & end of current day in WIB (Asia/Jakarta, UTC+7)
  const now = new Date();
  const wibOffsetMs = 7 * 60 * 60 * 1000;
  const wibDate = new Date(now.getTime() + wibOffsetMs);
  wibDate.setUTCHours(0, 0, 0, 0);
  const startOfTodayWib = new Date(wibDate.getTime() - wibOffsetMs);

  const [
    todayRevenueAgg,
    todayOrdersCount,
    totalOrdersCount,
    activeStoresCount,
    totalStoresCount,
    pendingDispatchCount,
    fastMovingGroup,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfTodayWib },
        status: { not: 'CANCELLED' },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startOfTodayWib },
        status: { not: 'CANCELLED' },
      },
    }),
    prisma.order.count({
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.store.count({
      where: { isVerified: true },
    }),
    prisma.store.count(),
    prisma.order.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'PACKING'] },
      },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: { not: 'CANCELLED' },
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    }),
  ]);

  // Enrich fastMovingProducts with product details in a single batch query (anti-N+1)
  const productIds = fastMovingGroup.map((g) => g.productId);
  const productRecords =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            stockCartons: true,
            cartonPrice: true,
          },
        })
      : [];

  const productMap = new Map(productRecords.map((p) => [p.id, p]));

  const fastMovingProducts = fastMovingGroup.map((group) => {
    const product = productMap.get(group.productId);
    return {
      productId: group.productId,
      sku: product?.sku || 'UNKNOWN',
      name: product?.name || 'Unknown Product',
      category: product?.category || 'Uncategorized',
      stockCartons: product?.stockCartons ?? 0,
      totalCartonsSold: group._sum.quantity || 0,
      totalRevenue: Number(group._sum.subtotal || 0),
    };
  });

  const kpiData = {
    todayRevenue: Number(todayRevenueAgg._sum.totalAmount || 0),
    todayOrders: todayOrdersCount,
    totalOrders: totalOrdersCount,
    activeStores: activeStoresCount,
    totalRegisteredStores: totalStoresCount,
    pendingDispatch: pendingDispatchCount,
    fastMovingProducts,
    generatedAt: new Date().toISOString(),
  };

  await setCache(CACHE_KEYS.KPI_SUMMARY, kpiData, CACHE_TTL.KPI_SUMMARY);

  return {
    kpi: kpiData,
    cacheHit: false,
  };
}

/**
 * GET /api/v1/admin/orders
 * Filtered & paginated list of orders by status and Sidoarjo district cluster.
 */
export async function getAdminOrders({ status, district, page = 1, limit = 20 }) {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (district) {
    where.store = {
      district: {
        equals: district,
        mode: 'insensitive',
      },
    };
  }

  const skip = (page - 1) * limit;

  const [totalItems, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            ownerName: true,
            phone: true,
            district: true,
            address: true,
            isVerified: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                category: true,
                batchNumber: true,
                expiryDate: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    orders: orders.map(serializeOrder),
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * PATCH /api/v1/admin/orders/:id/status
 * Enforces strict single-direction state machine with Compare-And-Swap (CAS) concurrency protection.
 * Uses `updateMany({ where: { id, status: currentStatus } })` so two concurrent `CANCELLED` requests
 * can never double-restock warehouse inventory.
 */
export async function updateOrderStatus(orderId, targetStatus, meta = {}) {
  const updatedOrder = await prisma.$transaction(
    async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!existingOrder) {
        throw new AppError(`Order with ID ${orderId} not found`, 404, [
          { field: 'id', message: 'Order not found' },
        ]);
      }

      const currentStatus = existingOrder.status;

      if (currentStatus === targetStatus) {
        throw new AppError(`Order is already in ${targetStatus} status`, 400, [
          {
            field: 'status',
            message: `Order status is already ${targetStatus}`,
          },
        ]);
      }

      const allowedNextStates = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

      if (!allowedNextStates.includes(targetStatus)) {
        throw new AppError(
          `Invalid state transition from ${currentStatus} to ${targetStatus}. Allowed transitions from ${currentStatus}: ${
            allowedNextStates.length > 0
              ? allowedNextStates.join(', ')
              : 'NONE (Terminal State)'
          }`,
          400,
          [
            {
              field: 'status',
              currentStatus,
              requestedStatus: targetStatus,
              allowedTransitions: allowedNextStates,
              message: `State transition ${currentStatus} -> ${targetStatus} is prohibited`,
            },
          ]
        );
      }

      // Compare-And-Swap (CAS) atomic status transition guard:
      // Ensures only ONE concurrent request can transition out of `currentStatus`
      const casUpdate = await tx.order.updateMany({
        where: {
          id: orderId,
          status: currentStatus,
        },
        data: {
          status: targetStatus,
          updatedAt: new Date(),
        },
      });

      if (casUpdate.count === 0) {
        throw new AppError(
          'Concurrent order status modification detected. Please refresh and try again.',
          409,
          [
            {
              field: 'status',
              message: 'Order status was concurrently modified by another request',
            },
          ]
        );
      }

      // If order is CANCELLED (from PENDING or CONFIRMED), atomically return stockCartons to inventory
      if (targetStatus === 'CANCELLED') {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockCartons: { increment: item.quantity },
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          action: 'ORDER_STATUS_UPDATED',
          entityType: 'ORDER',
          entityId: orderId,
          details: {
            trackingCode: existingOrder.trackingCode,
            previousStatus: currentStatus,
            newStatus: targetStatus,
          },
          ipAddress: meta.ipAddress || null,
        },
      });

      const savedOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          store: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  category: true,
                  stockCartons: true,
                },
              },
            },
          },
        },
      });

      return savedOrder;
    },
    {
      maxWait: 10000,
      timeout: 15000,
    }
  );

  // Invalidate KPI Summary & Public Catalog cache (if stock was restored on cancel)
  await invalidateCache(CACHE_KEYS.KPI_SUMMARY, CACHE_KEYS.CATALOG_PUBLIC);

  return serializeOrder(updatedOrder);
}

/**
 * GET /api/v1/admin/inventory/fefo
 * Returns warehouse inventory sorted by `expiryDate ASC` (First Expired, First Out)
 * with automated alert classification:
 * - EXPIRED: daysUntilExpiry <= 0
 * - DANGER:  expiry < 3 months (<= 90 days)
 * - WARNING: expiry < 6 months (<= 180 days)
 * - SAFE:    expiry >= 6 months (> 180 days)
 */
export async function getFefoInventory() {
  const products = await prisma.product.findMany({
    orderBy: [{ expiryDate: 'asc' }, { stockCartons: 'desc' }],
  });

  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;

  const threeMonthsFromNow = new Date(now);
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  const sixMonthsFromNow = new Date(now);
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  const items = products.map((product) => {
    const expiry = new Date(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / msPerDay);
    const monthsUntilExpiry = Number((daysUntilExpiry / 30).toFixed(1));

    let fefoStatus = 'SAFE';
    let fefoRecommendation = 'Normal FEFO rotation';

    if (expiry <= now) {
      fefoStatus = 'EXPIRED';
      fefoRecommendation = 'Quarantine batch immediately — Do not dispatch';
    } else if (expiry < threeMonthsFromNow) {
      fefoStatus = 'DANGER';
      fefoRecommendation =
        'CRITICAL FEFO (< 3 months): Prioritize immediate promo/dispatch to fast-moving stores';
    } else if (expiry < sixMonthsFromNow) {
      fefoStatus = 'WARNING';
      fefoRecommendation =
        'WARNING FEFO (< 6 months): Allocate batch first before newer production batches';
    }

    return {
      ...serializeProduct(product),
      daysUntilExpiry,
      monthsUntilExpiry,
      fefoStatus,
      fefoRecommendation,
    };
  });

  const summary = {
    totalSkus: items.length,
    totalCartonsInWarehouse: items.reduce((sum, p) => sum + p.stockCartons, 0),
    expiredCount: items.filter((p) => p.fefoStatus === 'EXPIRED').length,
    dangerCount: items.filter((p) => p.fefoStatus === 'DANGER').length,
    warningCount: items.filter((p) => p.fefoStatus === 'WARNING').length,
    safeCount: items.filter((p) => p.fefoStatus === 'SAFE').length,
  };

  return {
    summary,
    inventory: items,
  };
}

/**
 * GET /api/v1/admin/stores
 * Lists partner stores with optional `?verified=true|false`, `?district=...`, and pagination (`page`, `limit`).
 */
export async function getAdminStores({ verified, district, page = 1, limit = 50 } = {}) {
  const where = {};

  if (typeof verified === 'boolean') {
    where.isVerified = verified;
  }

  if (district) {
    where.district = {
      equals: district,
      mode: 'insensitive',
    };
  }

  const skip = (page - 1) * limit;

  const [totalItems, stores] = await Promise.all([
    prisma.store.count({ where }),
    prisma.store.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isVerified: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: { orders: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    stores: stores.map((store) => ({
      ...store,
      totalOrders: store._count.orders,
      _count: undefined,
    })),
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * PATCH /api/v1/admin/stores/:id/verify
 * Explicitly sets `isVerified` status for a partner store (idempotent, prevents accidental double-click toggle).
 */
export async function verifyStore(storeId, explicitIsVerified, meta = {}) {
  if (typeof explicitIsVerified !== 'boolean') {
    throw new AppError('isVerified (boolean) is required', 400, [
      { field: 'isVerified', message: 'Explicit boolean isVerified is required' },
    ]);
  }

  const existing = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!existing) {
    throw new AppError(`Store with ID ${storeId} not found`, 404, [
      { field: 'id', message: 'Store not found' },
    ]);
  }

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: { isVerified: explicitIsVerified },
  });

  await prisma.auditLog.create({
    data: {
      action: 'STORE_VERIFIED',
      entityType: 'STORE',
      entityId: storeId,
      details: {
        storeName: existing.name,
        previousStatus: existing.isVerified,
        newStatus: explicitIsVerified,
      },
      ipAddress: meta.ipAddress || null,
    },
  });

  await invalidateCache(CACHE_KEYS.KPI_SUMMARY);

  return updatedStore;
}

/**
 * POST /api/v1/admin/products
 * Creates a new product SKU in the warehouse & invalidates public catalog cache.
 */
export async function createProduct(payload, meta = {}) {
  const existingSku = await prisma.product.findUnique({
    where: { sku: payload.sku },
  });

  if (existingSku) {
    throw new AppError(`Product with SKU "${payload.sku}" already exists`, 409, [
      { field: 'sku', message: `SKU ${payload.sku} is already registered` },
    ]);
  }

  const product = await prisma.product.create({
    data: {
      sku: payload.sku,
      name: payload.name,
      category: payload.category,
      cartonPrice: payload.cartonPrice,
      retailPriceEst: payload.retailPriceEst,
      stockCartons: payload.stockCartons,
      batchNumber: payload.batchNumber,
      expiryDate: payload.expiryDate,
      imageUrl: payload.imageUrl || null,
      isAvailable: payload.isAvailable ?? true,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'PRODUCT_CREATED',
      entityType: 'PRODUCT',
      entityId: product.id,
      details: {
        sku: product.sku,
        name: product.name,
        category: product.category,
        stockCartons: product.stockCartons,
        batchNumber: product.batchNumber,
      },
      ipAddress: meta.ipAddress || null,
    },
  });

  await invalidateCache(CACHE_KEYS.CATALOG_PUBLIC, CACHE_KEYS.KPI_SUMMARY);

  return serializeProduct(product);
}

/**
 * PATCH /api/v1/admin/products/:id/stock
 * Updates product stock (absolute `stockCartons` or relative `addCartons`), batch/expiry, or pricing,
 * and invalidates `cache:catalog_public` + `cache:kpi_summary`.
 */
export async function updateProductStock(productId, payload, meta = {}) {
  const updateData = {};

  if (payload.cartonPrice !== undefined) updateData.cartonPrice = payload.cartonPrice;
  if (payload.retailPriceEst !== undefined) updateData.retailPriceEst = payload.retailPriceEst;
  if (payload.batchNumber !== undefined) updateData.batchNumber = payload.batchNumber;
  if (payload.expiryDate !== undefined) updateData.expiryDate = payload.expiryDate;
  if (payload.isAvailable !== undefined) updateData.isAvailable = payload.isAvailable;

  if (payload.stockCartons !== undefined) {
    updateData.stockCartons = payload.stockCartons;
  } else if (payload.addCartons !== undefined) {
    updateData.stockCartons = { increment: payload.addCartons };
  }

  const where = { id: productId };
  if (payload.stockCartons === undefined && payload.addCartons !== undefined && payload.addCartons < 0) {
    where.stockCartons = { gte: -payload.addCartons };
  }

  const { count } = await prisma.product.updateMany({
    where,
    data: updateData,
  });

  if (count === 0) {
    const exists = await prisma.product.findUnique({ where: { id: productId }, select: { stockCartons: true } });
    if (!exists) {
      throw new AppError(`Product with ID ${productId} not found`, 404, [
        { field: 'id', message: 'Product not found' },
      ]);
    }
    throw new AppError(
      `Resulting stockCartons cannot be negative (current: ${exists.stockCartons}, change: ${payload.addCartons})`,
      400,
      [{ field: 'addCartons', message: 'Stock cannot be reduced below 0' }]
    );
  }

  const updatedProduct = await prisma.product.findUnique({ where: { id: productId } });

  await prisma.auditLog.create({
    data: {
      action: 'PRODUCT_STOCK_UPDATED',
      entityType: 'PRODUCT',
      entityId: productId,
      details: payload,
      ipAddress: meta.ipAddress || null,
    },
  });

  await invalidateCache(CACHE_KEYS.CATALOG_PUBLIC, CACHE_KEYS.KPI_SUMMARY);

  return serializeProduct(updatedProduct);
}

/**
 * GET /api/v1/admin/audit-logs
 * Retrieves paginated audit trail of administrative operations.
 */
export async function getAuditLogs({ action, entityType, entityId, page = 1, limit = 20 } = {}) {
  const where = {};
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const skip = (page - 1) * limit;

  const [totalItems, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    logs,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
