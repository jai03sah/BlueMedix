import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';
import Franchise from '../model/franchise.model.js';

// Middleware to verify JWT token and attach user to request
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.Status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is not active. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Middleware to check if user is authenticated
export const isAuthenticated = verifyToken;

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  console.log('User Role:', req.user?.role);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is order manager
export const isOrderManager = (req, res, next) => {
  if (req.user && req.user.role === 'orderManager') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Order manager privileges required.' });
  }
};

// Middleware to check if user is franchise manager
export const isFranchiseManager = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'franchiseManager') {
      // If franchiseId is in params, verify the user manages this franchise
      if (req.params.franchiseId) {
        const franchise = await Franchise.findById(req.params.franchiseId);

        if (!franchise) {
          return res.status(404).json({ success: false, message: 'Franchise not found' });
        }

        // Check if user is assigned to this franchise
        if (franchise.manager && franchise.manager.toString() === req.user._id.toString()) {
          return next();
        } else {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You are not authorized to manage this franchise.'
          });
        }
      } else {
        // If no specific franchise is being accessed
        next();
      }
    } else {
      return res.status(403).json({ success: false, message: 'Access denied. Franchise manager privileges required.' });
    }
  } catch (error) {
    console.error('Franchise manager middleware error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Middleware to check if user is admin or order manager
export const isAdminOrManager = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'orderManager')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Admin or manager privileges required.' });
  }
};