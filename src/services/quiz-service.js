import mongoose from 'mongoose';
import { Quiz } from '../models/index.js';
import { customErrors } from '../utils/index.js';

const { NotFoundError, BadRequestError } = customErrors;

const QuizService = {};

QuizService.getQuizzes = async (params = {}) => {

    try {

        const { userId, paginationParams, documentId } = params;
        const  { offset, limit } = paginationParams ?? {};

        const query = {
            user: new mongoose.Types.ObjectId(userId), 
            document: new mongoose.Types.ObjectId(documentId),
        };

        const totalCount = await Quiz.countDocuments(query);

        const quizzes = await Quiz.find(query)
            .sort({ createdAt: -1 })
            .select('title score totalQuestions completedAt createdAt document user')
            .populate({ path: 'user', select: 'username'})
            .populate({ path: 'document', select: 'originalFileName title'})
            .skip(offset)
            .limit(limit)
            .lean();

        return { quizzes, totalCount };

    } catch (error) {

        throw error;
    }
};

QuizService.getQuizById = async (params = {}) => {
    try {

        const { quizId, userId } = params;

        const quiz = await Quiz.findOne({ _id: quizId, user: userId });

        if (!quiz)
            throw new NotFoundError('Quiz not found');


        return { quiz };

    } catch (error) {

        throw error;
    }
};

QuizService.submitQuiz = async (params = {}) => {
    try {

        const { quizId, userId, answers } = params;

        const quiz = await Quiz.findOne({ _id: quizId, user: userId });

        if (!quiz)
            throw new NotFoundError('Quiz not found');


        if (quiz.completedAt)
            throw new BadRequestError('Quiz already completed');

        let score = 0;
        const userAnswers = [];
        const questions = quiz.questions;

        // Validate answers format
        if (!Array.isArray(answers))
            throw new BadRequestError('Answers must be an array');


        // Process each answer
        for (const answer of answers) {
            const { questionIndex, selectedAnswer } = answer;

            if (questionIndex >= 0 && questionIndex < questions.length) {
                const question = questions[questionIndex];
                const isCorrect = question.correctAnswer === selectedAnswer;

                if (isCorrect) {
                    score++;
                }

                userAnswers.push({
                    questionIndex,
                    selectedAnswer,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
        }

        // Update quiz
        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        return {
            score,
            totalQuestions: quiz.totalQuestions,
            userAnswers
        };


    } catch (error) {

        throw error;

    }
};

QuizService.getQuizResults = async (params = {}) => {
    try {

        const { quizId, userId } = params;

        const quiz = await Quiz.findOne({ _id: quizId, user: userId });

        if (!quiz)
            throw new NotFoundError('Quiz not found');


        if (!quiz.completedAt)
            throw new BadRequestError('Quiz not yet completed');


        return {
            score: quiz.score,
            totalQuestions: quiz.totalQuestions,
            userAnswers: quiz.userAnswers,
            completedAt: quiz.completedAt
        };

    } catch (error) {

        throw error;
    }
};

QuizService.deleteQuiz = async (params = {}) => {
    try {

        const { quizId, userId } = params;

        const quiz = await Quiz.findOneAndDelete({ _id: quizId, user: userId });

        if (!quiz)
            throw new NotFoundError('Quiz not found');


        return { message: 'Quiz deleted successfully' };

    } catch (error) {

        throw error;

    }
};

export default QuizService;
