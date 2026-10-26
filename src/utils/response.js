/**
 * Custom application error with HTTP status code and optional error details array.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard Success JSON Envelope per PRD section 6:
 * { "success": true, "message": "...", "data": ... }
 */
export function sendSuccess(res, { statusCode = 200, message = 'Success', data = null, meta = undefined }) {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

/**
 * Standard Error JSON Envelope per PRD section 6:
 * { "success": false, "message": "...", "errors": [...] }
 */
export function sendError(res, { statusCode = 500, message = 'Internal Server Error', errors = [] }) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

