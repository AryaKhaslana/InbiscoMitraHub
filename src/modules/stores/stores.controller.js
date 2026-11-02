import { sendSuccess } from '../../utils/response.js';
import * as storesService from './stores.service.js';

export async function registerStore(req, res, next) {
  try {
    const store = await storesService.registerStore(req.body);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Store registered successfully',
      data: store,
    });
  } catch (error) {
    return next(error);
  }
}

export async function lookupStore(req, res, next) {
  try {
    const store = await storesService.lookupStoreByPhone(req.body.phone);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Partner store retrieved successfully',
      data: store,
    });
  } catch (error) {
    return next(error);
  }
}

export async function submitContactInquiry(req, res, next) {
  try {
    const result = await storesService.createContactInquiry(req.body);

    return sendSuccess(res, {
      statusCode: 201,
      message: result.message,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}


