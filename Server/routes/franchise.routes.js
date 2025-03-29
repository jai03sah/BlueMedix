import express from 'express';
import {
  createFranchise,
  getAllFranchises,
  getFranchiseById,
  updateFranchise,
  assignManagerToFranchise,
  getFranchiseOrders,
  getFranchiseStats
} from '../controllers/franchise.controller.js';
import { verifyToken, isAdmin, isAdminOrManager } from '../middleware/auth.middleware.js';

const router = express.Router();

// Admin routes
router.post('/', verifyToken, isAdmin, createFranchise);
router.get('/', verifyToken, isAdmin, getAllFranchises);
router.put('/:franchiseId', verifyToken, isAdmin, updateFranchise);
router.post('/assign-manager', verifyToken, isAdmin, assignManagerToFranchise);

// Admin or manager routes
router.get('/:franchiseId', verifyToken, isAdminOrManager, getFranchiseById);
router.get('/:franchiseId/orders', verifyToken, isAdminOrManager, getFranchiseOrders);
router.get('/:franchiseId/stats', verifyToken, isAdminOrManager, getFranchiseStats);

export default router;