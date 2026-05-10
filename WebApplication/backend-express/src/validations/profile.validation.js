import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    nama: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    nomor_telepon: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
  }),
});
