import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getUserOrders,
  generateInvoice
} from '../controllers/order.controller.js';
import { verifyToken, isAdmin, isAdminOrManager } from '../middleware/auth.middleware.js';

const router = express.Router();

// User routes
router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getUserOrders);

// Admin or manager routes
router.get('/', verifyToken, isAdminOrManager, getAllOrders);
router.get('/:orderId', verifyToken, isAdminOrManager, getOrderById);
router.patch('/:orderId/status', verifyToken, isAdminOrManager, updateOrderStatus);
router.post('/:orderId/invoice', verifyToken, isAdminOrManager, generateInvoice);

// Admin only routes
router.patch('/:orderId/payment', verifyToken, isAdmin, updatePaymentStatus);

export default router;