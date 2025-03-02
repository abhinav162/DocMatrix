import express from 'express';
import authRoutes from './authRoutes';
import documentRoutes from './documentRoutes';
import scanRoutes from './scanRoutes';
import creditRoutes from './creditRoutes';

const router = express.Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/scan', scanRoutes);
router.use('/credits', creditRoutes);

export default router;
