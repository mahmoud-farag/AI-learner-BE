import { STATUS_CODES } from '../common/index.js';
import { aiService } from '../services/index.js';
import { handleSuccessResponse } from '../utils/index.js';

import { customErrors } from '../utils/index.js';

const { BadRequestError } = customErrors;

const aiController = {};

const DEFULT_GENERATED_FLASH_CARDS = 5;
const MAX_ALLOWED_FLASH_CARDS = 100;

aiController.generateFlashcards = async (req, res, next) => {
    try {

        if (!req.body?.documentId)
            throw new BadRequestError('Document Id is required');

        const numberOfFlashcards = req.body?.numberOfFlashcards ?? DEFULT_GENERATED_FLASH_CARDS;

        if (numberOfFlashcards > MAX_ALLOWED_FLASH_CARDS)
            throw new BadRequestError(`You exceed the 100 flashcard limitation`);


        const result = await aiService.generateFlashcards({ numberOfFlashcards, documentId: req.body.documentId, userId: req.user._id });

        return handleSuccessResponse({ res, data: { ...result }, message: result?.message ?? 'Flashcards generated successfully' });

    } catch (error) {

        next(error);

    }
};

aiController.generateQuiz = async (req, res, next) => {
    try {


        if (!req.body?.documentId)
            throw new BadRequestError('Document Id is required');

        const DEFAULT_NUM_QUESTIONS = 5;

        const params = {
            documentId: req.body.documentId,
            numQuestions: req.body?.numQuestions ?? DEFAULT_NUM_QUESTIONS,
            userId: req.user._id,
        };

        const result = await aiService.generateQuiz(params);

        return handleSuccessResponse({ res, data: result, message: 'Quiz generated successfully' });

    } catch (error) {

        next(error);
    }
};

aiController.generateSummary = async (req, res, next) => {
    try {

        if (!req.body?.documentId)
            throw new BadRequestError('Document Id is required');

        const result = await aiService.generateSummary({ documentId: req.body.documentId , userId: req.user._id });

        return handleSuccessResponse({ res, data: result, message: 'Summary generated successfully' });

    } catch (error) {

        next(error);
    }
};

aiController.chat = async (req, res, next) => {
    try {

        if (!req.body?.documentId)
            throw new BadRequestError('Document Id is required');

        if (!req.body?.question)
            throw new BadRequestError('Question is missing');

        const params = {
            documentId: req.body.documentId,
            question: req.body.question,
            userId: req.user._id,
        };

        const result = await aiService.chat(params);

        return handleSuccessResponse({ res, data: result, message: 'Response generated successfully' });

    } catch (error) {

        next(error);
    }
};

aiController.explainConcept = async (req, res, next) => {
    try {

        if (!req.body?.documentId)
            throw new BadRequestError('Document Id is required');

        if (!req.body?.concept)
            throw new BadRequestError('Concept is missing');
        

        const params = {
            documentId: req.body.documentId,
            concept: req.body.concept,
            userId: req.user._id,
        }

        const result = await aiService.explainConcept(params);
        
        return handleSuccessResponse({ res, data: result, message: 'Explanation generated successfully' });

    } catch (error) {

        next(error);
    }
};

aiController.getChatHistory = async (req, res, next) => {
    try {

        
        if (!req.params?.documentId) 
            throw new BadRequestError('Document Id is required');

   

        if (!req?.paginationParams)
            throw new BadRequestError('Pagination params not found');

        const params = {
            documentId: req.params.documentId,
            userId: req.user._id,
            paginationParams: req.paginationParams,
        };
        
        const result = await aiService.getChatHistory(params);

        return handleSuccessResponse({ res, data: result, message: 'history data successfully retrieved' });

    } catch (error) {
        next(error);
    }
};

export default aiController;
