import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import AppError from '../utils/AppError.js';
import { normalizeEmail } from '../utils/normalize.js';

const defaultKey = (req) => ipKeyGenerator(req.ip || req.socket?.remoteAddress || 'unknown');

export const emailIpKey = (req) => {
  const email = normalizeEmail(req.body?.email);
  return `${defaultKey(req)}:${email || 'no-email'}`;
};

export const userIpKey = (req) => {
  const userId = req.user?.id || 'anonymous';
  return `${userId}:${defaultKey(req)}`;
};

export const createRateLimiter = ({
  name,
  windowMs,
  max,
  keyGenerator = defaultKey,
  message = 'Terlalu banyak request. Silakan coba lagi nanti.',
}) => {
  if (!name || !Number.isFinite(windowMs) || !Number.isFinite(max) || windowMs <= 0 || max <= 0) {
    throw new Error('Invalid rate limiter configuration');
  }

  return rateLimit({
    windowMs,
    max,
    keyGenerator,
    legacyHeaders: false,
    standardHeaders: true,
    handler: (req, res, next) => {
      next(new AppError(message, 429));
    },
  });
};

export const __rateLimitTestUtils = {
  stores: {
    clear: () => {},
  },
};
