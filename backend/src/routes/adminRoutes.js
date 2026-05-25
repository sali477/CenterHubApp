import { Router } from 'express';
import {
  getAnalytics,
  verifyCenter,
  verifyTeacher,
  deactivateUser,
  getReports,
  resolveReport,
  getAllUsers,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/centers/:id/verify', verifyCenter);
router.put('/teachers/:id/verify', verifyTeacher);
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);

export default router;
