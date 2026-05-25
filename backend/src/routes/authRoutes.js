import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

export default router;
