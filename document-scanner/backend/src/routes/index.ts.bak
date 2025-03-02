import express from 'express';
import authRoutes from './authRoutes';
import documentRoutes from './documentRoutes';
import scanRoutes from './scanRoutes';

const router = express.Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/scan', scanRoutes);

export default router;
