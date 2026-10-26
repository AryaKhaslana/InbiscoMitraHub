import crypto from 'node:crypto';

const ALPHANUMERIC_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates an order tracking code with 8 high-entropy random alphanumeric chars (~1.1 trillion combinations):
 * Format: INB-YYMM-XXXXXXXX (e.g. INB-2610-A9F2K7M4)
 */
export function generateTrackingCode(date = new Date(), randomLength = 8) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');

  let randomSuffix = '';
  const bytes = crypto.randomBytes(randomLength);
  for (let i = 0; i < randomLength; i += 1) {
    randomSuffix += ALPHANUMERIC_CHARS[bytes[i] % ALPHANUMERIC_CHARS.length];
  }

  return `INB-${yy}${mm}-${randomSuffix}`;
}
