import express from 'express';
import { 
  updateFranchiseStock, 
  getFranchiseStock, 
  getProductStockAcrossFranchises, 
  getProductStockInFranchise, 
  deleteStockEntry,
  getLowStockItems
} from '../controllers/franchisestock.controller.js';
import { isAuthenticated, isAdmin, isFranchiseManager } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all stock for a specific franchise
router.get('/franchise/:franchiseId', isAuthenticated, getFranchiseStock);

// Get stock for a specific product across all franchises
router.get('/product/:productId', isAuthenticated, getProductStockAcrossFranchises);

// Get stock for a specific product in a specific franchise
router.get('/franchise/:franchiseId/product/:productId', isAuthenticated, getProductStockInFranchise);

// Get low stock items across all franchises
router.get('/low-stock', isAuthenticated, getLowStockItems);

// Update product stock in a franchise (admin or franchise manager)
router.put('/franchise/:franchiseId/product/:productId', 
  isAuthenticated, 
  (req, res, next) => {
    // Allow both admins and franchise managers for this route
    if (req.user.role === 'admin') {
      return next();
    }
    return isFranchiseManager(req, res, next);
  }, 
  updateFranchiseStock
);

// Delete stock entry (admin only)
router.delete('/:stockId', isAuthenticated, isAdmin, deleteStockEntry);

export default router;