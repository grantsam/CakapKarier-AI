import { z } from 'zod';
import { normalizeEmail } from '../utils/normalize.js';

const emailSchema = z.string().trim().email('Format email tidak valid').transform(normalizeEmail);

export const signupSchema = z.object({
  body: z.object({
    nama: z.string().trim().min(3, 'Nama minimal 3 karakter'),
    email: emailSchema,
    password: z.string().min(8, 'Password minimal 8 karakter'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(8, 'Password minimal 8 karakter'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().trim().min(32, 'Token reset password tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
  }),
});
