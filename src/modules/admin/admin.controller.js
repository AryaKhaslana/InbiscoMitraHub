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
      req.body.status
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
      req.body?.isVerified
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
    const product = await adminService.createProduct(req.body);

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
      req.body
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

