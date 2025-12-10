import express from 'express';
import { authController } from '../controllers/index.js';
import { checkAuth } from '../middlewares/index.js';

const router = express.Router();



// public routes 
router.post('/register', authController.register);
router.post('/login', authController.login);




// protected routes
router.get('/get-profile', checkAuth, authController.getUserProfile);
router.patch('/change-password', checkAuth, authController.changePassword);





export default router;

















