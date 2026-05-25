import { Router } from 'express';
import { getExam, startExam, submitExam } from '../controllers/examController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/:id', getExam);
router.post('/:id/start', startExam);
router.post('/:id/submit', submitExam);

export default router;
