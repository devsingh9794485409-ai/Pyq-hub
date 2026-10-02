// backend/routes/userRoutes.js
import { Router } from 'express';
import {
  getUserProfile,
  listUsers,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// Public: view any user's profile + uploads
router.get('/:id', getUserProfile);

// Admin: list all users
router.get('/', protect, adminOnly, listUsers);

// Self or Admin: update user fields
router.patch('/:id', protect, updateUser);

// Admin: delete a user
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
