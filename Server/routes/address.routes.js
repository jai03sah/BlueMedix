import express from 'express';
import {
  createAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
  getAddressById
} from '../controllers/address.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected with verifyToken middleware
router.post('/', verifyToken, createAddress);
router.get('/', verifyToken, getUserAddresses);
router.get('/:addressId', verifyToken, getAddressById);
router.put('/:addressId', verifyToken, updateAddress);
router.delete('/:addressId', verifyToken, deleteAddress);

export default router;