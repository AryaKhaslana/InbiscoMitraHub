import crypto from 'node:crypto';

const ALPHANUMERIC_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates an order tracking code in the format:
 * INB-YYMM-XXXX (e.g. INB-2610-A9F2)
 */
export function generateTrackingCode(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');

  let randomSuffix = '';
  const bytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i += 1) {
    randomSuffix += ALPHANUMERIC_CHARS[bytes[i] % ALPHANUMERIC_CHARS.length];
  }

  return `INB-${yy}${mm}-${randomSuffix}`;
}

