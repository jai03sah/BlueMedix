import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getProductsByCategory
} from '../controllers/product.controller.js';
import { verifyToken, isAdmin, isAdminOrManager } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:productId', getProductById);
router.get('/category/:categoryId', getProductsByCategory);

// Admin routes
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:productId', verifyToken, isAdmin, updateProduct);
router.delete('/:productId', verifyToken, isAdmin, deleteProduct);

// Admin or manager routes
router.patch('/:productId/stock', verifyToken, isAdminOrManager, updateProductStock);

export default router;