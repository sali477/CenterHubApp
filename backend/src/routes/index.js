import { Router } from 'express';
import authRoutes from './authRoutes.js';
import centerRoutes from './centerRoutes.js';
import teacherRoutes from './teacherRoutes.js';
import courseRoutes from './courseRoutes.js';
import enrollmentRoutes from './enrollmentRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import messageRoutes from './messageRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import liveSessionRoutes from './liveSessionRoutes.js';
import adminRoutes from './adminRoutes.js';
import aiRoutes from './aiRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import reportRoutes from './reportRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import quizRoutes from './quizRoutes.js';
import examRoutes from './examRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/centers', centerRoutes);
router.use('/teachers', teacherRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/live-sessions', liveSessionRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/upload', uploadRoutes);
router.use('/reports', reportRoutes);
router.use('/payments', paymentRoutes);
router.use('/quizzes', quizRoutes);
router.use('/exams', examRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'CentreHub Morocco API is running' });
});

export default router;
