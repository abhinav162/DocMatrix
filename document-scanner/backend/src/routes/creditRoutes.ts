import express from 'express';
import { CreditController } from '../controllers/creditController';
import { AuthMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * @route GET /credits
 * @description Get current credit balance
 * @access Private
 */
router.get(
  '/',
  AuthMiddleware.isAuthenticated,
  CreditController.getCreditBalance
);

/**
 * @route POST /credits/request
 * @description Request additional credits
 * @access Private
 */
router.post(
  '/request',
  AuthMiddleware.isAuthenticated,
  CreditController.requestCredits
);

/**
 * @route GET /credits/requests
 * @description Get all pending credit requests (admin only)
 * @access Admin only
 */
router.get(
  '/requests',
  AuthMiddleware.isAdmin,
  CreditController.getPendingRequests
);

/**
 * @route POST /credits/approve/:id
 * @description Approve a credit request (admin only)
 * @access Admin only
 */
router.post(
  '/approve/:id',
  AuthMiddleware.isAdmin,
  CreditController.approveRequest
);

/**
 * @route POST /credits/deny/:id
 * @description Deny a credit request (admin only)
 * @access Admin only
 */
router.post(
  '/deny/:id',
  AuthMiddleware.isAdmin,
  CreditController.denyRequest
);

export default router;
