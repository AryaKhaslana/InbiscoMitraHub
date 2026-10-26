import { sendSuccess } from '../../utils/response.js';
import * as ordersService from './orders.service.js';

export async function createOrder(req, res, next) {
  try {
    const order = await ordersService.createOrder(req.body);

    return sendSuccess(res, {
      statusCode: 201,
      message: `Order created successfully with tracking code ${order.trackingCode}`,
      data: order,
    });
  } catch (error) {
    return next(error);
  }
}

export async function trackOrder(req, res, next) {
  try {
    const order = await ordersService.getOrderByTrackingCode(req.params.code);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Order tracking details retrieved successfully',
      data: order,
    });
  } catch (error) {
    return next(error);
  }
}

