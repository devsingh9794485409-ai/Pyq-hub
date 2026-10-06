// backend/routes/adminRoutes.js
import { Router } from 'express';
import {
  getDashboard,
  getUsers,
  setAdminRole,
  deleteUser,
  getResources,
  deleteResource,
  getSubjects,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/dashboard',          getDashboard);
router.get('/users',              getUsers);
router.patch('/users/:id',        setAdminRole);
router.delete('/users/:id',       deleteUser);
router.get('/resources',          getResources);
router.delete('/resources/:id',   deleteResource);
router.get('/subjects',           getSubjects);

export default router;
