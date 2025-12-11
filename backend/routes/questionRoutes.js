import express from 'express';
import {togglePinQuestion,updateQuestionNote,addQuestionsToSession} from '../controllers/questionController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Question Routes
router.post('/add', protect, addQuestionsToSession);         // Add questions to a session
router.post('/:id/pin', protect, togglePinQuestion);         // Toggle pin on a question
router.post('/:id/note', protect, updateQuestionNote);       // Add or update note on a question

export default router;
