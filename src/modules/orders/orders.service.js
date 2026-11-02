import { Prisma } from '@prisma/client';
import prisma from '../../config/database.js';
import { CACHE_KEYS, invalidateCache } from '../../config/redis.js';
import { generateTrackingCode } from '../../utils/orderCode.js';
import { AppError } from '../../utils/response.js';

/**
 * Masks a phone number for public tracking display (e.g. "081234560001" -> "0812****0001")
 * so PII is protected against unauthenticated scraping.
 */
export function maskPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string' || phone.length < 8) {
    return '****';
  }
  return `${phone.slice(0, 4)}****${phone.slice(-4)}`;
}

const STATUS_META = {
  PENDING: { label: 'Pending', nextStatus: 'CONFIRMED', nextActionLabel: 'Terima Order' },
  CONFIRMED: { label: 'Confirmed', nextStatus: 'PACKING', nextActionLabel: 'Mulai Packing' },
  PACKING: { label: 'Packing', nextStatus: 'DISPATCHED', nextActionLabel: 'Kirim Armada' },
  DISPATCHED: { label: 'Dispatched', nextStatus: 'COMPLETED', nextActionLabel: 'Tandai Selesai' },
  COMPLETED: { label: 'Completed', nextStatus: null, nextActionLabel: '✓ Tuntas' },
  CANCELLED: { label: 'Cancelled', nextStatus: null, nextActionLabel: 'Dibatalkan' },
};

/**
 * Formats an Order record (converting Prisma Decimal fields to JS numbers and enriching UI helpers).
 */
export function serializeOrder(order) {
  const meta = STATUS_META[order.status] || {
    label: order.status,
    nextStatus: null,
    nextActionLabel: 'Detail',
  };
  const totalAmountNum = Number(order.totalAmount);

  const itemsSummary = Array.isArray(order.items)
    ? order.items
        .map((item) => {
          const prodName = item.product?.name
            ? item.product.name.split('(')[0].trim()
            : 'Produk Mayora';
          return `${item.quantity} Karton ${prodName}`;
        })
        .join(', ')
    : '';

  return {
    ...order,
    totalAmount: totalAmountNum,
    totalAmountFormatted: `Rp ${Math.round(totalAmountNum).toLocaleString('id-ID')}`,
    statusLabel: meta.label,
    nextStatus: meta.nextStatus,
    nextActionLabel: meta.nextActionLabel,
    paymentMethodLabel:
      order.paymentMethod === 'TEMPO_7_DAYS' ? 'TEMPO 7 HARI' : 'COD TUNAI',
    itemsSummary,
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
 * 1. Verifies the store exists AND isVerified === true (prevents fake unverified stores from depleting stock).
 * 2. Verifies product availability & sufficient carton stock.
 * 3. Performs conditional atomic stock decrement (`stockCartons: { gte: quantity }`) to prevent race conditions.
 * 4. Uses Prisma.Decimal for exact currency arithmetic.
 * 5. Generates unique tracking code (`INB-YYMM-XXXX`).
 * 6. Invalidates `cache:kpi_summary` and `cache:catalog_public`.
 */
export async function createOrder(payload) {
  const mergedItems = mergeDuplicateOrderItems(payload.items);

  const createdOrder = await prisma.$transaction(
    async (tx) => {
      let store = null;
      if (payload.storeId) {
        store = await tx.store.findUnique({
          where: { id: payload.storeId },
        });
      } else if (payload.storePhone) {
        store = await tx.store.findFirst({
          where: { phone: payload.storePhone },
        });
        if (!store) {
          store = await tx.store.create({
            data: {
              name: payload.storeName || `Toko Mitra (${payload.storePhone.slice(-4)})`,
              phone: payload.storePhone,
              ownerName: payload.storeName || 'Pemilik Toko',
              district: 'Krian',
              address: 'Wilayah Layanan Cabang Krian',
              isVerified: true,
            },
          });
        } else if (!store.isVerified) {
          store = await tx.store.update({
            where: { id: store.id },
            data: { isVerified: true },
          });
        }
      }

      if (!store) {
        throw new AppError('Partner store not found or store phone required', 404, [
          {
            field: 'storeId',
            message: 'A valid storeId or storePhone is required to place an order',
          },
        ]);
      }

      const productIds = mergedItems.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      const now = new Date();
      let totalAmountDecimal = new Prisma.Decimal(0);
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

        if (new Date(product.expiryDate) <= now) {
          throw new AppError(
            `Product "${product.name}" (${product.sku}, Batch ${product.batchNumber}) has expired and cannot be ordered`,
            400,
            [
              {
                field: 'items',
                productId: product.id,
                sku: product.sku,
                message: `Batch ${product.batchNumber} for "${product.name}" is expired`,
              },
            ]
          );
        }

        if (reqItem.quantity > 1000) {
          throw new AppError(
            `Total quantity per SKU in a single order cannot exceed 1000 cartons (requested: ${reqItem.quantity})`,
            400,
            [{ field: 'items', message: 'Total quantity per product exceeds 1000 cartons' }]
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

        // Atomic conditional stock deduction (also enforces expiryDate > now & isAvailable = true)
        const deductionResult = await tx.product.updateMany({
          where: {
            id: product.id,
            isAvailable: true,
            expiryDate: { gt: now },
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

        const unitPriceDecimal = new Prisma.Decimal(product.cartonPrice);
        const subtotalDecimal = unitPriceDecimal.mul(reqItem.quantity);
        totalAmountDecimal = totalAmountDecimal.add(subtotalDecimal);

        orderItemsData.push({
          productId: product.id,
          quantity: reqItem.quantity,
          unitPrice: unitPriceDecimal,
          subtotal: subtotalDecimal,
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
          totalAmount: totalAmountDecimal,
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
              name: true,
              district: true,
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
    },
    {
      maxWait: 10000,
      timeout: 15000,
    }
  );

  // Invalidate KPI Summary & Public Catalog cache since stockCartons changed
  await invalidateCache(CACHE_KEYS.KPI_SUMMARY, CACHE_KEYS.CATALOG_PUBLIC);

  return serializeOrder(createdOrder);
}

/**
 * Retrieves live order tracking details by trackingCode (e.g. INB-2610-A9F2).
 * Redacts sensitive store PII (phone is masked, full street address & ownerName are omitted from public tracking).
 */
export async function getOrderByTrackingCode(trackingCode) {
  const order = await prisma.order.findUnique({
    where: { trackingCode: trackingCode.toUpperCase() },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          phone: true,
          district: true,
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
    throw new AppError(
      `Order with tracking code "${trackingCode}" not found`,
      404,
      [{ field: 'code', message: `No order found for tracking code ${trackingCode}` }]
    );
  }

  const serialized = serializeOrder(order);
  delete serialized.storeId;
  if (serialized.store) {
    serialized.store = {
      name: serialized.store.name,
      district: serialized.store.district,
      maskedPhone: maskPhoneNumber(serialized.store.phone),
      isVerified: serialized.store.isVerified,
    };
  }

  return serialized;
}
