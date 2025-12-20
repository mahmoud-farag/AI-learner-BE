import express from 'express';
import { quizController } from '../controllers/index.js';
import { checkAuth, pagination } from '../middlewares/index.js';

const router = express.Router();


router.get('/get-quiz/:quizId', checkAuth, quizController.getQuizById);
router.post('/:quizId/submit', checkAuth, quizController.submitQuiz);
router.get('/:quizId/results', checkAuth, quizController.getQuizResults);
router.delete('/:quizId', checkAuth, quizController.deleteQuiz);
router.get('/:documentId', checkAuth, pagination, quizController.getQuizzes);

export default router;
