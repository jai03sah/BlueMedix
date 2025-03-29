import express from 'express';
import { 
  addToCart, 
  getUserCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cart.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(isAuthenticated);

// Add item to cart
router.post('/add', addToCart);

// Get user's cart
router.get('/',  getUserCart);

// Update cart item quantity
router.put('/item/:cartItemId',  updateCartItem);

// Remove item from cart
router.delete('/item/:cartItemId',  removeFromCart);

// Clear user's cart
router.delete('/clear', clearCart);

export default router;