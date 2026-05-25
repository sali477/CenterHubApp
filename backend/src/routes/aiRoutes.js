import { Router } from 'express';
import {
  smartSearch,
  getRecommendations,
  courseAssistant,
  generateQuiz,
  studyPlanner,
  chatbot,
  summarizeContent,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/smart-search', optionalAuth, smartSearch);
router.post('/chatbot', optionalAuth, chatbot);
router.get('/recommendations', protect, getRecommendations);
router.post('/assistant', protect, courseAssistant);
router.post('/generate-quiz', protect, generateQuiz);
router.post('/study-planner', protect, studyPlanner);
router.post('/summarize', protect, summarizeContent);

export default router;
