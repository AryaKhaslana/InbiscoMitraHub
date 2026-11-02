import { getClientIp } from '../../middlewares/rateLimit.middleware.js';
import { sendSuccess } from '../../utils/response.js';
import * as adminService from './admin.service.js';

export async function getKpiSummary(req, res, next) {
  try {
    const { kpi, cacheHit } = await adminService.getKpiSummary();
    res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Admin KPI summary retrieved successfully',
      data: kpi,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const { orders, meta } = await adminService.getAdminOrders(req.query);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Admin orders retrieved successfully',
      data: orders,
      meta,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const updatedOrder = await adminService.updateOrderStatus(
      req.params.id,
      req.body.status,
      { ipAddress: getClientIp(req) }
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: `Order status updated to ${updatedOrder.status}`,
      data: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFefoInventory(req, res, next) {
  try {
    const fefoData = await adminService.getFefoInventory();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'FEFO inventory list retrieved successfully',
      data: fefoData,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getStores(req, res, next) {
  try {
    const { stores, meta } = await adminService.getAdminStores(req.query);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Partner stores retrieved successfully',
      data: stores,
      meta,
    });
  } catch (error) {
    return next(error);
  }
}

export async function verifyStore(req, res, next) {
  try {
    const updatedStore = await adminService.verifyStore(
      req.params.id,
      req.body?.isVerified,
      { ipAddress: getClientIp(req) }
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: `Store verification status updated to ${updatedStore.isVerified}`,
      data: updatedStore,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await adminService.createProduct(req.body, {
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Product added to warehouse catalog successfully',
      data: product,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProductStock(req, res, next) {
  try {
    const product = await adminService.updateProductStock(
      req.params.id,
      req.body,
      { ipAddress: getClientIp(req) }
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Product stock and batch details updated successfully',
      data: product,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const result = await adminService.deleteProduct(req.params.id, {
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const { logs, meta } = await adminService.getAuditLogs(req.query);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Admin audit logs retrieved successfully',
      data: logs,
      meta,
    });
  } catch (error) {
    return next(error);
  }
}

export async function loginPortal(req, res, next) {
  try {
    const session = await adminService.loginPortal(req.body, {
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Autentikasi portal operasional berhasil',
      data: session,
    });
  } catch (error) {
    return next(error);
  }
}

export async function recordDailySales(req, res, next) {
  try {
    const result = await adminService.recordDailySales(req.body, {
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: `Penjualan ${result.quantityCartons} dus ${result.productName} berhasil direkam & stok diperbarui`,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDailySalesLogs(req, res, next) {
  try {
    const data = await adminService.getDailySalesLogs(req.query);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Data penjualan harian (DSR) berhasil diambil',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function runWhatIfSimulation(req, res, next) {
  try {
    const simulation = await adminService.runWhatIfSimulation(req.body);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Simulasi What-If Restock & Lead Time berhasil dihitung',
      data: simulation,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getStockoutRiskAnalysis(req, res, next) {
  try {
    const analysis = await adminService.getStockoutRiskAnalysis();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Analisis risiko stockout & rekomendasi cross-depot berhasil diambil',
      data: analysis,
    });
  } catch (error) {
    return next(error);
  }
}

export async function executeCrossDepotTransfer(req, res, next) {
  try {
    const transfer = await adminService.executeCrossDepotTransfer(req.body, {
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: `Realokasi stok antar-depo (${transfer.transferCode}) berhasil dieksekusi`,
      data: transfer,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getRestockRecommendations(req, res, next) {
  try {
    const data = await adminService.getRestockRecommendations();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Rekomendasi Smart Replenishment & kalkulasi FTL berhasil diambil',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function batchApprovePo(req, res, next) {
  try {
    const po = await adminService.batchApprovePo(req.body, {
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: `Purchase Order ${po.poNumber} berhasil diterbitkan ke Mayora Plant DC Pasuruan`,
      data: po,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getInboundDeliveries(req, res, next) {
  try {
    const data = await adminService.getInboundDeliveries();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Data pelacakan armada inbound & GPS telemetri berhasil diambil',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function confirmInboundDelivery(req, res, next) {
  try {
    const bast = await adminService.confirmInboundDelivery(
      req.params.doNumber,
      req.body,
      { ipAddress: getClientIp(req) }
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: `BAST ${bast.bastNumber} untuk ${bast.doNumber} terverifikasi & stok gudang diperbarui`,
      data: bast,
    });
  } catch (error) {
    return next(error);
  }
}

export async function syncSap(req, res, next) {
  try {
    const syncResult = await adminService.syncSap({
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Sinkronisasi SAP S/4HANA & refresh cache berhasil',
      data: syncResult,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDailyManifest(req, res, next) {
  try {
    const manifest = await adminService.getDailyManifest();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Manifest harian muat armada berhasil dibuat',
      data: manifest,
    });
  } catch (error) {
    return next(error);
  }
}

export async function exportOrdersCsv(req, res, next) {
  try {
    const csvContent = await adminService.generateOrdersCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Inbisco_Orders_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    return next(error);
  }
}

export async function getDistributorNodes(req, res, next) {
  try {
    const data = await adminService.getDistributorNodes();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Direktori distributor regional Jawa Timur berhasil diambil',
      data,
    });
  } catch (error) {
    return next(error);
  }
}


