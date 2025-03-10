import express from 'express';
import { ScanController } from '../controllers/scanController';
import { AuthMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * @route POST /scan
 * @description Scan a document against all accessible documents
 * @access Private
 */
router.post(
  '/',
  AuthMiddleware.isAuthenticated,
  ScanController.scanDocument
);

/**
 * @route GET /scan/matches/:docId
 * @description Get previous scan results for a document
 * @access Private
 */
router.get(
  '/matches/:docId',
  AuthMiddleware.isAuthenticated,
  ScanController.getPreviousScanResults
);

/**
 * @route GET /export/:sourceDocumentId
 * @description Export scan results
 * @access Private
 */
router.get(
  '/export/:sourceDocumentId',
  AuthMiddleware.isAuthenticated,
  ScanController.exportScanResults
);

export default router;
