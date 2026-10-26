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

