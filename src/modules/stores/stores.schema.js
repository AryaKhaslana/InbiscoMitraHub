import { z } from 'zod';

/**
 * Valid districts (Kecamatan) in Kabupaten Sidoarjo for UMKM distribution clustering.
 */
export const SIDOARJO_DISTRICTS = [
  'Balongbendo',
  'Buduran',
  'Candi',
  'Gedangan',
  'Jabon',
  'Krembung',
  'Krian',
  'Porong',
  'Prambon',
  'Sedati',
  'Sidoarjo',
  'Sukodono',
  'Taman',
  'Tanggulangin',
  'Tarik',
  'Tulangan',
  'Waru',
  'Wonoayu',
];

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

/**
 * Normalize Indonesian phone numbers to standard 08xxxxxxxx format.
 */
export function normalizePhoneNumber(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+62')) {
    return `0${cleaned.slice(3)}`;
  }
  if (cleaned.startsWith('62')) {
    return `0${cleaned.slice(2)}`;
  }
  return cleaned;
}

export const registerStoreSchema = z
  .object({
    name: z
      .string({ required_error: 'Store name is required' })
      .trim()
      .min(3, 'Store name must be at least 3 characters')
      .max(120, 'Store name must not exceed 120 characters'),
    ownerName: z
      .string({ required_error: 'Owner name is required' })
      .trim()
      .min(2, 'Owner name must be at least 2 characters')
      .max(100, 'Owner name must not exceed 100 characters'),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .transform(normalizePhoneNumber)
      .refine((val) => phoneRegex.test(val), {
        message: 'Invalid Indonesian mobile phone number (e.g. 081234567890)',
      }),
    district: z
      .string({ required_error: 'District (Kecamatan) is required' })
      .trim()
      .min(2, 'District name is too short')
      .refine(
        (val) =>
          SIDOARJO_DISTRICTS.some(
            (d) => d.toLowerCase() === val.toLowerCase()
          ),
        {
          message: `District must be a valid kecamatan in Sidoarjo (${SIDOARJO_DISTRICTS.join(', ')})`,
        }
      )
      .transform((val) => {
        const matched = SIDOARJO_DISTRICTS.find(
          (d) => d.toLowerCase() === val.toLowerCase()
        );
        return matched || val;
      }),
    address: z
      .string({ required_error: 'Full address is required' })
      .transform((val) => val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim())
      .pipe(
        z
          .string()
          .min(5, 'Address must be at least 5 characters')
          .max(500, 'Address must not exceed 500 characters')
      ),
    postalCode: z.string().optional().nullable(),
    storeType: z.string().optional().nullable(),
    nik: z.string().optional().nullable(),
  })
  .passthrough();

export const contactInquirySchema = z
  .object({
    name: z
      .string({ required_error: 'Nama lengkap wajib diisi' })
      .trim()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama maksimal 100 karakter'),
    phone: z
      .string({ required_error: 'Nomor WhatsApp wajib diisi' })
      .trim()
      .transform(normalizePhoneNumber)
      .refine((val) => phoneRegex.test(val), {
        message: 'Format nomor WhatsApp tidak valid (contoh: 081234567890)',
      }),
    storeName: z.string().trim().max(120).optional().nullable(),
    category: z.string().trim().max(100).optional().nullable(),
    message: z
      .string({ required_error: 'Pesan wajib diisi' })
      .trim()
      .min(5, 'Pesan minimal 5 karakter')
      .max(1000, 'Pesan maksimal 1000 karakter'),
  })
  .passthrough();

export const lookupStoreSchema = z
  .object({
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .transform(normalizePhoneNumber)
      .refine((val) => phoneRegex.test(val), {
        message: 'Invalid Indonesian mobile phone number (e.g. 081234567890)',
      }),
  })
  .strict();

