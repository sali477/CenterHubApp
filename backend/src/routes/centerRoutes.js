import { Router } from 'express';
import {
  getCenters,
  getCenter,
  getMyCenter,
  createCenter,
  updateCenter,
  regenerateInvitationCode,
  getCenterStats,
  getCenterRevenue,
  removeTeacherFromCenter,
  deleteCenter,
} from '../controllers/centerController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getCenters);
router.get('/my', protect, authorize('center_owner', 'admin'), getMyCenter);
router.get('/:id', getCenter);
router.get('/:id/stats', protect, authorize('center_owner', 'admin'), getCenterStats);
router.get('/:id/revenue', protect, authorize('center_owner', 'admin'), getCenterRevenue);
router.post('/', protect, authorize('center_owner', 'student', 'teacher'), createCenter);
router.put('/:id', protect, authorize('center_owner', 'admin'), updateCenter);
router.post('/:id/invitation-code', protect, authorize('center_owner'), regenerateInvitationCode);
router.delete('/:id/teachers/:teacherId', protect, authorize('center_owner'), removeTeacherFromCenter);
router.delete('/:id', protect, authorize('center_owner', 'admin'), deleteCenter);

export default router;
