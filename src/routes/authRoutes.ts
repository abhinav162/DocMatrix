import express from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * @route POST /auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', AuthController.register);

/**
 * @route POST /auth/create-admin
 * @description Create an admin user
 * @access Public
 */
router.post('/create-admin', AuthController.createAdmin);

/**
 * @route POST /auth/login
 * @description Log in a user
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route GET /auth/logout
 * @description Log out a user
 * @access Public
 */
router.get('/logout', AuthController.logout);

/**
 * @route GET /auth/profile
 * @description Get current user profile
 * @access Private
 */
router.get('/profile', AuthMiddleware.isAuthenticated, AuthController.profile);

export default router;
