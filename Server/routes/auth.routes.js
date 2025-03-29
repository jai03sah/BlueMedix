import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  createAdmin
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:userId', verifyEmail);

// Admin creation route (protected by secret key in request body)
router.post('/create-admin', createAdmin);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;