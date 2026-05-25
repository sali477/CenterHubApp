import { Router } from 'express';
import {
  sendMessage,
  getConversations,
  getMessages,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:userId', getMessages);
router.post('/', sendMessage);

export default router;
