import prisma from '../../config/database.js';
import { CACHE_KEYS, invalidateCache } from '../../config/redis.js';
import { generateTrackingCode } from '../../utils/orderCode.js';
import { AppError } from '../../utils/response.js';

/**
 * Formats an Order record (converting Prisma Decimal fields to JS numbers).
 */
export function serializeOrder(order) {
  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          product: item.product
            ? {
                ...item.product,
                cartonPrice:
                  item.product.cartonPrice !== undefined
                    ? Number(item.product.cartonPrice)
                    : undefined,
                retailPriceEst:
                  item.product.retailPriceEst !== undefined
                    ? Number(item.product.retailPriceEst)
                    : undefined,
              }
            : undefined,
        }))
      : undefined,
  };
}

/**
 * Consolidates duplicate productIds in the order items array into single line items.
 */
function mergeDuplicateOrderItems(items) {
  const itemMap = new Map();
  for (const item of items) {
    const currentQty = itemMap.get(item.productId) || 0;
    itemMap.set(item.productId, currentQty + item.quantity);
  }
  return Array.from(itemMap.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

/**
 * Creates a wholesale restock order inside an atomic Prisma transaction:
 * 1. Verifies the store exists.
 * 2. Verifies product availability & sufficient carton stock.
 * 3. Performs conditional atomic stock decrement (`stockCartons: { gte: quantity }`) to prevent race conditions.
 * 4. Generates unique tracking code (`INB-YYMM-XXXX`).
 * 5. Invalidates `cache:kpi_summary` and `cache:catalog_public`.
 */
export async function createOrder(payload) {
  const mergedItems = mergeDuplicateOrderItems(payload.items);

  const createdOrder = await prisma.$transaction(async (tx) => {
    const store = await tx.store.findUnique({
      where: { id: payload.storeId },
    });

    if (!store) {
      throw new AppError('Partner store not found', 404, [
        { field: 'storeId', message: `Store with ID ${payload.storeId} does not exist` },
      ]);
    }

    const productIds = mergedItems.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const orderItemsData = [];

    for (const reqItem of mergedItems) {
      const product = productMap.get(reqItem.productId);

      if (!product) {
        throw new AppError(`Product ${reqItem.productId} not found`, 400, [
          {
            field: 'items',
            message: `Product ID ${reqItem.productId} does not exist`,
          },
        ]);
      }

      if (!product.isAvailable) {
        throw new AppError(
          `Product "${product.name}" (${product.sku}) is currently unavailable`,
          400,
          [
            {
              field: 'items',
              message: `Product "${product.name}" is inactive/unavailable`,
            },
          ]
        );
      }

      if (product.stockCartons < reqItem.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name}". Requested: ${reqItem.quantity} cartons, Available: ${product.stockCartons} cartons`,
          400,
          [
            {
              field: 'items',
              productId: product.id,
              sku: product.sku,
              requested: reqItem.quantity,
              available: product.stockCartons,
              message: `Insufficient stock for "${product.name}"`,
            },
          ]
        );
      }

      // Atomic conditional stock deduction to prevent concurrent overselling
      const deductionResult = await tx.product.updateMany({
        where: {
          id: product.id,
          isAvailable: true,
          stockCartons: { gte: reqItem.quantity },
        },
        data: {
          stockCartons: { decrement: reqItem.quantity },
        },
      });

      if (deductionResult.count === 0) {
        throw new AppError(
          `Concurrent stock conflict or insufficient cartons for "${product.name}"`,
          400,
          [
            {
              field: 'items',
              productId: product.id,
              message: `Stock for "${product.name}" was just depleted by another order`,
            },
          ]
        );
      }

      const unitPrice = Number(product.cartonPrice);
      const subtotal = Number((unitPrice * reqItem.quantity).toFixed(2));
      totalAmount = Number((totalAmount + subtotal).toFixed(2));

      orderItemsData.push({
        productId: product.id,
        quantity: reqItem.quantity,
        unitPrice,
        subtotal,
      });
    }

    // Generate collision-free tracking code (INB-YYMM-XXXX)
    let trackingCode = generateTrackingCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await tx.order.findUnique({
        where: { trackingCode },
        select: { id: true },
      });
      if (!existing) break;
      trackingCode = generateTrackingCode();
    }

    const order = await tx.order.create({
      data: {
        trackingCode,
        storeId: store.id,
        totalAmount,
        paymentMethod: payload.paymentMethod || 'COD',
        status: 'PENDING',
        notes: payload.notes || null,
        items: {
          create: orderItemsData,
        },
      },
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
    });

    return order;
  });

  // Invalidate KPI Summary & Public Catalog cache since stockCartons changed
  await invalidateCache(CACHE_KEYS.KPI_SUMMARY, CACHE_KEYS.CATALOG_PUBLIC);

  return serializeOrder(createdOrder);
}

/**
 * Retrieves live order tracking details by trackingCode (e.g. INB-2610-A9F2).
 */
export async function getOrderByTrackingCode(trackingCode) {
  const order = await prisma.order.findUnique({
    where: { trackingCode: trackingCode.toUpperCase() },
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
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(`Order with tracking code "${trackingCode}" not found`, 404, [
      { field: 'code', message: `No order found for tracking code ${trackingCode}` },
    ]);
  }

  return serializeOrder(order);
}

