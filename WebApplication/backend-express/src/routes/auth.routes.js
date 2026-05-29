import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { createRateLimiter, emailIpKey } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from '../validations/auth.validation.js';

const router = Router();

const signupLimiter = createRateLimiter({
  name: 'auth-signup',
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: emailIpKey,
  message: 'Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti.',
});

const loginLimiter = createRateLimiter({
  name: 'auth-login',
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyGenerator: emailIpKey,
  message: 'Terlalu banyak percobaan masuk. Silakan coba lagi dalam beberapa menit.',
});

const forgotPasswordLimiter = createRateLimiter({
  name: 'auth-forgot-password',
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: emailIpKey,
  message: 'Terlalu banyak permintaan pemulihan kata sandi. Silakan coba lagi nanti.',
});

const resetPasswordLimiter = createRateLimiter({
  name: 'auth-reset-password',
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Terlalu banyak percobaan reset kata sandi. Silakan coba lagi nanti.',
});

router.post('/signup', validate(signupSchema), signupLimiter, authController.signup);
router.post('/login', validate(loginSchema), loginLimiter, authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordLimiter, authController.resetPassword);

export default router;
