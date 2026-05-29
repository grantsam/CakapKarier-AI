import { Router } from 'express';
import * as analysisController from '../controllers/analysis.controller.js';
import { protect } from '../middleware/auth.js';
import { createRateLimiter, userIpKey } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import {
  careerMatchAnalysisSchema,
  careerMatchHistoryDetailSchema,
  careerMatchHistoryQuerySchema,
} from '../validations/analysis.validation.js';

const router = Router();

router.use(protect);

const careerMatchLimiter = createRateLimiter({
  name: 'career-match-analysis',
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: userIpKey,
  message: 'Terlalu banyak permintaan analisis. Silakan coba lagi nanti.',
});

router.get('/career-match/health', analysisController.getCareerMatchHealth);
router.get('/career-match/genai/health', analysisController.getCareerMatchGenaiHealth);
router.get(
  '/career-match/history',
  validate(careerMatchHistoryQuerySchema),
  analysisController.getCareerMatchHistory
);
router.get(
  '/career-match/history/:id',
  validate(careerMatchHistoryDetailSchema),
  analysisController.getCareerMatchHistoryDetail
);
router.post(
  '/career-match',
  validate(careerMatchAnalysisSchema),
  careerMatchLimiter,
  analysisController.createCareerMatchAnalysis
);

export default router;
