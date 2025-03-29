import User from '../model/user.model.js';
import Address from '../model/address.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user', // Default role
      address_info: [] // Initialize empty address array
    });

    // Create address if provided
    if (address) {
      // Parse address if it's a string
      let addressData = address;
      if (typeof address === 'string') {
        try {
          // Try to create a simple address object from the string
          addressData = {
            Street: address,
            city: '',
            state: '',
            pincode: '',
            country: '',
            phone_number: phone
          };
        } catch (err) {
          console.error('Error parsing address string:', err);
        }
      }

      // Create address record
      const newAddress = await Address.create({
        Street: addressData.Street || addressData.street || '',
        city: addressData.city || '',
        state: addressData.state || '',
        pincode: addressData.pincode || addressData.zipcode || '',
        country: addressData.country || '',
        phone_number: addressData.phone_number || phone,
        status: true
      });

      // Add address to user's address_info array
      user.address_info.push(newAddress._id);
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      Status: user.Status,
      address_info: user.address_info,
      verify_email: user.verify_email
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if account is active
    if (user.Status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is not active. Please contact support.' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login date
    user.last_login_date = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      Status: user.Status,
      verify_email: user.verify_email,
      franchise: user.franchise
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Logout user
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('franchise', 'name address contactNumber email');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Forgot password - generate OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expiry (10 minutes)
    user.forgot_password_otp = otp;
    user.forgot_password_expiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // In a real application, you would send this OTP via email
    // For now, we'll just return it in the response (for development purposes)
    return res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email',
      otp // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Reset password with OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      forgot_password_otp: otp,
      forgot_password_expiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = newPassword;
    user.forgot_password_otp = null;
    user.forgot_password_expiry = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.verify_email = true;
    await user.save();

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create admin user (protected by admin secret key)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, adminSecretKey } = req.body;

    // Verify admin secret key
    if (!adminSecretKey || adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      console.error('Invalid admin secret key');
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid admin secret key' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create new admin user
    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
      verify_email: true, // Auto-verify admin emails
      Status: 'Active'    // Auto-activate admin accounts
    });

    // Generate token
    const token = generateToken(admin._id);

    // Return admin data without password
    const adminData = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      Status: admin.Status,
      verify_email: admin.verify_email
    };

    return res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: adminData,
      token
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};