import express from 'express';
import authRoutes from './authRoutes';

const router = express.Router();

// Register all routes
router.use('/auth', authRoutes);

export default router;
