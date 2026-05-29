import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validations/profile.validation.js';

const router = Router();

// Semua route di sini butuh login
router.use(protect);

router.get('/profile', profileController.getProfile);
router.put('/profile', validate(updateProfileSchema), profileController.updateProfile);

export default router;
