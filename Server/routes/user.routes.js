import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  changeUserStatus,
  createManager,
  getAllManagers,
  changePassword
} from '../controllers/user.controller.js';
import { verifyToken, isAdmin, isAdminOrManager } from '../middleware/auth.middleware.js';

const router = express.Router();

// Admin routes
router.get('/', verifyToken, isAdmin, getAllUsers);
router.post('/manager', verifyToken, isAdmin, createManager);
router.get('/managers', verifyToken, isAdmin, getAllManagers);
router.patch('/:userId/status', verifyToken, isAdmin, changeUserStatus);

// Admin or manager routes
router.get('/:userId', verifyToken, isAdminOrManager, getUserById);

// User routes (protected)
router.patch('/:userId', verifyToken, updateUserProfile);
router.post('/change-password', verifyToken, changePassword);

export default router; 