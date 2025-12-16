import express from 'express';
import { dashboardController } from '../controllers/index.js';
import { checkAuth } from '../middlewares/index.js';

const router = express.Router();



router.get('/', checkAuth, dashboardController.getDashboardData);





export default router;

















