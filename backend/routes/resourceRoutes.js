// backend/routes/resourceRoutes.js
import { Router } from 'express';
import {
  getResources,
  createResource,
  deleteResource,
  toggleUpvote,
  toggleBookmark,
  incrementDownload,
} from '../controllers/resourceController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { singleFile } from '../middleware/upload.js';

const router = Router();

router.get('/',                  optionalAuth, getResources);
router.post('/',                 protect, singleFile, createResource);
router.delete('/:id',            protect, deleteResource);
router.post('/:id/upvote',       protect, toggleUpvote);
router.post('/:id/bookmark',     protect, toggleBookmark);
router.post('/:id/download',     optionalAuth, incrementDownload);

export default router;