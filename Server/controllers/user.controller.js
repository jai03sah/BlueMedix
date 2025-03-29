
import User from '../model/user.model.js';
import Franchise from '../model/franchise.model.js';
import bcrypt from 'bcryptjs';

// Get all users (admin only) 
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('franchise', 'name address contactNumber email');

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('franchise', 'name address contactNumber email')
      .populate('address_info')
      .populate('shopping_cart')
      .populate('order_history');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, img_url } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the user is updating their own profile or if admin is updating
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (img_url) user.img_url = img_url;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        img_url: user.img_url,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Change user status (admin only)
export const changeUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.Status = status;
    await user.save();

    return res.status(200).json({ success: true, message: `User status changed to ${status}` });
  } catch (error) {
    console.error('Change user status error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create manager with optional franchise (admin only)
export const createManager = async (req, res) => {
  try {
    const { name, email, password, phone, franchiseId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create manager data object
    const managerData = {
      name,
      email,
      password,
      phone,
      role: 'orderManager'
    };

    // If franchiseId is provided, check if franchise exists and associate it
    if (franchiseId) {
      const franchise = await Franchise.findById(franchiseId);
      if (!franchise) {
        return res.status(404).json({ success: false, message: 'Franchise not found' });
      }

      // Add franchise to manager data
      managerData.franchise = franchiseId;
    }

    // Create new manager
    const manager = await User.create(managerData);

    // If franchiseId is provided, update franchise with new manager
    if (franchiseId) {
      await Franchise.findByIdAndUpdate(franchiseId, { orderManager: manager._id });
    }

    return res.status(201).json({
      success: true,
      message: 'Manager created successfully',
      manager: {
        _id: manager._id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        role: manager.role,
        franchise: franchiseId || null
      }
    });
  } catch (error) {
    console.error('Create manager error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all managers (admin only)
export const getAllManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'orderManager' })
      .select('-password')
      .populate('franchise', 'name address contactNumber email');

    return res.status(200).json({ success: true, managers });
  } catch (error) {
    console.error('Get all managers error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    const { oldpassword, newpassword } = req.body;
    console.log('Change password request:', req.body);
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(oldpassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newpassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
