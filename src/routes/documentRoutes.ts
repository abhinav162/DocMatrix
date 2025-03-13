import express from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/documentController';
import { AuthMiddleware } from '../middleware/auth';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * @route POST /documents/upload
 * @description Upload a new document
 * @access Private
 */
router.post(
  '/upload',
  AuthMiddleware.isAuthenticated,
  upload.single('file'),
  DocumentController.uploadDocument
);

/**
 * @route GET /documents
 * @description List user's documents
 * @access Private
 */
router.get(
  '/',
  AuthMiddleware.isAuthenticated,
  DocumentController.listDocuments
);

/**
 * @route GET /documents/:id
 * @description Get document details
 * @access Private
 */
router.get(
  '/:id',
  AuthMiddleware.isAuthenticated,
  DocumentController.getDocument
);

/**
 * @route PATCH /documents/:id/privacy
 * @description Toggle document privacy
 * @access Private
 */
router.patch(
  '/:id/privacy',
  AuthMiddleware.isAuthenticated,
  DocumentController.togglePrivacy
);

/**
 * @route DELETE /documents/:id
 * @description Delete a document
 * @access Private
 */
router.delete(
  '/:id',
  AuthMiddleware.isAuthenticated,
  DocumentController.deleteDocument
);

export default router;
