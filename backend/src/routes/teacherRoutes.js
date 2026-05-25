import { Router } from 'express';
import {
  getTeachers,
  getTeacher,
  createTeacherProfile,
  joinCenter,
  createIndependentAcademy,
  updateTeacher,
  getTeacherStudents,
} from '../controllers/teacherController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = Router();

router.get('/', getTeachers);
router.get('/:id', getTeacher);
router.get('/:id/students', protect, authorize('teacher', 'admin'), getTeacherStudents);
router.post('/', protect, createTeacherProfile);
router.post('/join-center', protect, authorize('teacher', 'student'), joinCenter);
router.post('/independent-academy', protect, authorize('teacher'), createIndependentAcademy);
router.put('/:id', protect, authorize('teacher', 'admin'), updateTeacher);

export default router;
