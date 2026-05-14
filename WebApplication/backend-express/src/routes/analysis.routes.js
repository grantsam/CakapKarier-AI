import { Router } from 'express';
import * as analysisController from '../controllers/analysis.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  careerMatchAnalysisSchema,
  careerMatchHistoryDetailSchema,
  careerMatchHistoryQuerySchema,
} from '../validations/analysis.validation.js';

const router = Router();

router.use(protect);

router.get('/career-match/health', analysisController.getCareerMatchHealth);
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
  analysisController.createCareerMatchAnalysis
);

export default router;
