// backend/routes/subjectRoutes.js
import { Router } from 'express';
import { getSubjects, getSubjectById } from '../controllers/subjectController.js';

const router = Router();

router.get('/', getSubjects);
router.get('/:id', getSubjectById);

export default router;