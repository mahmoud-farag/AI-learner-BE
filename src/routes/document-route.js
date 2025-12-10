import express from 'express';

import { documentController } from '../controllers/index.js';
import { checkAuth } from '../middlewares/index.js';
import uploadFiles from '../config/multer.js';

const router = express.Router();


// public routes



// protected routes
router.post('/upload-pdf', checkAuth, uploadFiles({ allowedMimeTypes: ['application/pdf'] }), documentController.uploadDocument);
router.get('/', checkAuth, documentController.getDocuments);
router.get('/:id', checkAuth, documentController.getDocument);
router.delete('/:id', checkAuth, documentController.deleteDocument);
router.put('/:id', checkAuth, documentController.updateDocument);

export default router;
