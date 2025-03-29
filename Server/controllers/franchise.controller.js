import Franchise from '../model/franchise.model.js';
import User from '../model/user.model.js';
import Order from '../model/order.model.js';

// Create a new franchise (admin only)
export const createFranchise = async (req, res) => {
  try {
    const { name, address, contactNumber, email } = req.body;

    // Check if franchise with this email already exists
    const existingFranchise = await Franchise.findOne({ email });
    if (existingFranchise) {
      return res.status(400).json({ success: false, message: 'Franchise already exists with this email' });
    }

    // Create franchise
    const franchise = await Franchise.create({
      name,
      address,
      contactNumber,
      email,
      isActive: true
    });

    const populatedFranchise = {
      _franchiseId: franchise._id,
      name: franchise.name,
      address: franchise.address,
      contactNumber: franchise.contactNumber,
      email: franchise.email,
    };

    return res.status(201).json({
      success: true,
      message: 'Franchise created successfully',
      franchise: populatedFranchise
    });
  } catch (error) {
    console.error('Create franchise error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all franchises
export const getAllFranchises = async (req, res) => {
  try {
    // Check if user is authenticated and is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    // Find all franchises, excluding passwords, and populate franchise details
    const franchises = await Franchise.find()
      .select('-password')
      .populate('franchiseDetails', 'name address contactNumber email');

    if (!franchises || franchises.length === 0) {
      return res.status(404).json({ success: false, message: 'No franchises found' });
    }

    return res.status(200).json({ success: true, franchises });
  } catch (error) {
    console.error('Get all franchises error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get franchise by ID
export const getFranchiseById = async (req, res) => {
  try {
    const { franchiseId } = req.params;

    const franchise = await Franchise.findById(franchiseId);

    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    return res.status(200).json({ success: true, franchise });
  } catch (error) {
    console.error('Get franchise by ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update franchise
export const updateFranchise = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const { name, address, contactNumber, email, isActive } = req.body;

    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    // Update fields
    if (name) franchise.name = name;
    if (address) franchise.address = address;
    if (contactNumber) franchise.contactNumber = contactNumber;
    if (email) franchise.email = email;
    if (isActive !== undefined) franchise.isActive = isActive;

    await franchise.save();

    // Populate order manager for response
    const updatedFranchise = await Franchise.findById(franchiseId)
      .populate('orderManager', 'name email phone');

    return res.status(200).json({
      success: true,
      message: 'Franchise updated successfully',
      franchise: updatedFranchise
    });
  } catch (error) {
    console.error('Update franchise error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Assign manager to franchise
export const assignManagerToFranchise = async (req, res) => {
  try {
    const { franchiseId, managerId } = req.body;

    // Check if franchise exists
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    // Check if manager exists and is a manager
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    if (manager.role !== 'orderManager') {
      return res.status(400).json({ success: false, message: 'User is not a manager' });
    }

    // If manager is already assigned to another franchise, remove that assignment
    if (manager.franchise) {
      const previousFranchise = await Franchise.findById(manager.franchise);
      if (previousFranchise && previousFranchise.orderManager.toString() === managerId) {
        previousFranchise.orderManager = null;
        await previousFranchise.save();
      }
    }

    // Update franchise with new manager
    franchise.orderManager = managerId;
    await franchise.save();

    // Update manager with franchise
    manager.franchise = franchiseId;
    await manager.save();

    return res.status(200).json({
      success: true,
      message: 'Manager assigned to franchise successfully',
      franchise: {
        _id: franchise._id,
        name: franchise.name,
        manager: {
          _id: manager._id,
          name: manager.name,
          email: manager.email
        }
      }
    });
  } catch (error) {
    console.error('Assign manager to franchise error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get franchise orders
export const getFranchiseOrders = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Check if franchise exists
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    // Check if user has permission to view franchise orders
    if (req.user.role === 'orderManager' && 
        req.user.franchise && 
        req.user.franchise.toString() !== franchiseId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view orders for this franchise' });
    }

    // Build filter
    const filter = { franchise: franchiseId };
    if (status) filter.deliverystatus = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateObj;
      }
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get orders
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('product_id', 'name price image')
      .populate('deliveryAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      franchise: franchise.name,
      orders,
      pagination: {
        total: totalOrders,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalOrders / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get franchise orders error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get franchise statistics
export const getFranchiseStats = async (req, res) => {
  try {
    const { franchiseId } = req.params;

    // Check if franchise exists
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    // Check if user has permission to view franchise stats
    if (req.user.role === 'orderManager' && 
        req.user.franchise && 
        req.user.franchise.toString() !== franchiseId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view stats for this franchise' });
    }

    // Get total orders
    const totalOrders = await Order.countDocuments({ franchise: franchiseId });

    // Get orders by status
    const pendingOrders = await Order.countDocuments({ 
      franchise: franchiseId, 
      deliverystatus: 'pending' 
    });
    
    const acceptedOrders = await Order.countDocuments({ 
      franchise: franchiseId, 
      deliverystatus: 'accepted' 
    });
    
    const dispatchedOrders = await Order.countDocuments({ 
      franchise: franchiseId, 
      deliverystatus: 'dispatched' 
    });
    
    const deliveredOrders = await Order.countDocuments({ 
      franchise: franchiseId, 
      deliverystatus: 'delivered' 
    });
    
    const cancelledOrders = await Order.countDocuments({ 
      franchise: franchiseId, 
      deliverystatus: 'cancelled' 
    });

    // Get total revenue
    const revenueResult = await Order.aggregate([
      { 
        $match: { 
          franchise: franchise._id,
          deliverystatus: 'delivered'
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get recent orders
    const recentOrders = await Order.find({ franchise: franchiseId })
      .populate('user', 'name')
      .populate('product_id', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      franchise: franchise.name,
      stats: {
        totalOrders,
        ordersByStatus: {
          pending: pendingOrders,
          accepted: acceptedOrders,
          dispatched: dispatchedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get franchise stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};