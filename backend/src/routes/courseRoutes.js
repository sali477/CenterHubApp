import { Router } from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addCourseComment,
} from '../controllers/courseController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourse);
router.post('/', protect, authorize('teacher', 'center_owner'), createCourse);
router.put('/:id', protect, authorize('teacher', 'center_owner', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);
router.post('/:id/comments', protect, addCourseComment);

export default router;
