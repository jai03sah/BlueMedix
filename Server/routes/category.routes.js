import express from 'express';
import { 
  createCategory, 
  getAllCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory,
  getProductsCountByCategory
} from '../controllers/category.controller.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:categoryId', getCategoryById);
router.get('/stats/products-count', getProductsCountByCategory);

// Admin routes
router.post('/', isAuthenticated, isAdmin, createCategory);
router.put('/:categoryId', isAuthenticated, isAdmin, updateCategory);
router.delete('/:categoryId', isAuthenticated, isAdmin, deleteCategory);

export default router;