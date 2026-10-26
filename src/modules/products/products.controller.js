import { sendSuccess } from '../../utils/response.js';
import * as productsService from './products.service.js';

export async function listPublicProducts(req, res, next) {
  try {
    const { category, search } = req.query;
    const { products, cacheHit } = await productsService.getPublicCatalog({
      category,
      search,
    });

    res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Public product catalog retrieved successfully',
      data: products,
    });
  } catch (error) {
    return next(error);
  }
}

