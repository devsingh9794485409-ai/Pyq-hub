// backend/routes/userRoutes.js
import { Router } from 'express';
import { getUserProfile } from '../controllers/userController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:id', optionalAuth, getUserProfile);

export default router;
