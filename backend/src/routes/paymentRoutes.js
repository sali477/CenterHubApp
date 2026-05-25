import { Router } from 'express';
import {
  createCheckout,
  verifyPayment,
  cmiCallback,
  getPaymentHistory,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/create-checkout', protect, createCheckout);
router.get('/verify', protect, verifyPayment);
router.post('/cmi/callback', cmiCallback);
router.get('/history', protect, getPaymentHistory);

export default router;
