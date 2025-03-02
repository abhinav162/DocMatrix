import express from 'express';
import authRoutes from './authRoutes';
import documentRoutes from './documentRoutes';

const router = express.Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);

export default router;
