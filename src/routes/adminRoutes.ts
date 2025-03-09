import express from 'express';
import { AdminController } from '../controllers/adminController';
import { AuthMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * @route GET /admin/users
 * @description List all users
 * @access Admin only
 */
router.get(
  '/users',
  AuthMiddleware.isAdmin,
  AdminController.listUsers
);

/**
 * @route PATCH /admin/users/:userId/role
 * @description Update user roles
 * @access Admin only
 */
router.patch(
  '/users/:userId/role',
  AuthMiddleware.isAdmin,
  AdminController.updateUserRole
);

/**
 * @route GET /admin/credits/requests
 * @description List pending credit requests
 * @access Admin only
 */
router.get(
  '/credits/requests',
  AuthMiddleware.isAdmin,
  AdminController.listPendingCreditRequests
);

/**
 * @route POST /admin/credits/:userId
 * @description Adjust user credits
 * @access Admin only
 */
router.post(
  '/credits/:userId',
  AuthMiddleware.isAdmin,
  AdminController.adjustUserCredits
);

/**
 * @route GET /admin/analytics
 * @description Get system usage analytics
 * @access Admin only
 */
router.get(
  '/analytics',
  AuthMiddleware.isAdmin,
  AdminController.getSystemAnalytics
);

export default router;
