// backend/routes/resourceRoutes.js
import { Router } from 'express';
import {
  getResources,
  createResource,
  toggleUpvote,
  deleteResource,
} from '../controllers/resourceController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { singleFile } from '../middleware/upload.js';

const router = Router();

router.get('/', optionalAuth, getResources);
router.post('/', protect, singleFile, createResource);
router.post('/:id/upvote', protect, toggleUpvote);
router.delete('/:id', protect, deleteResource);

export default router;