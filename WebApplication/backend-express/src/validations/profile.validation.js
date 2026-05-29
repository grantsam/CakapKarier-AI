import { z } from 'zod';
import { normalizeEmail, normalizeOptionalText } from '../utils/normalize.js';

const optionalProfileText = z
  .string()
  .transform(normalizeOptionalText)
  .optional()
  .nullable();

export const updateProfileSchema = z.object({
  body: z.object({
    nama: z.string().trim().min(3, 'Nama minimal 3 karakter'),
    email: z.string().trim().email('Format email tidak valid').transform(normalizeEmail),
    nomor_telepon: optionalProfileText,
    bio: optionalProfileText,
  }),
});
