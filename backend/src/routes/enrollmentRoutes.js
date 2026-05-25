import { Router } from 'express';
import {
  enrollInCourse,
  getMyEnrollments,
  updateProgress,
  getEnrollmentByCourse,
} from '../controllers/enrollmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = Router();

router.post('/', protect, authorize('student', 'teacher', 'center_owner'), enrollInCourse);
router.get('/my', protect, getMyEnrollments);
router.get('/course/:courseId', protect, getEnrollmentByCourse);
router.put('/:id/progress', protect, updateProgress);

export default router;
