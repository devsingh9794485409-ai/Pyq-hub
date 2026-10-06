// backend/routes/authRoutes.js
import { Router } from 'express';
import {
  signup,
  login,
  me,
  firebaseAuth,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/signup',          signup);
router.post('/login',           login);
router.get('/me',               protect, me);
router.post('/firebase',        firebaseAuth);       // Google / Firebase OAuth
router.post('/forgot-password', forgotPassword);     // Phase 3
router.post('/reset-password',  resetPassword);      // Phase 3

export default router;