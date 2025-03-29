import Address from '../model/address.model.js';
import User from '../model/user.model.js';

// Create a new address for a user
export const createAddress = async (req, res) => {
  try {
    const { Street, city, state, pincode, country, phone_number } = req.body;
    const userId = req.user._id;

    // Create new address
    const address = await Address.create({
      Street,
      city,
      state,
      pincode,
      country,
      phone_number,
      status: true
    });

    // Add address to user's address_info array
    await User.findByIdAndUpdate(
      userId,
      { $push: { address_info: address._id } },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address
    });
  } catch (error) {
    console.error('Create address error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all addresses for a user
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and populate addresses
    const user = await User.findById(userId).populate('address_info');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      addresses: user.address_info
    });
  } catch (error) {
    console.error('Get user addresses error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update an address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { Street, city, state, pincode, country, phone_number, status } = req.body;
    const userId = req.user._id;

    // Find the address
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Check if user owns this address
    const user = await User.findById(userId);
    if (!user.address_info.includes(addressId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this address' });
    }

    // Update address fields
    if (Street !== undefined) address.Street = Street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (country !== undefined) address.country = country;
    if (phone_number !== undefined) address.phone_number = phone_number;
    if (status !== undefined) address.status = status;

    await address.save();

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user owns this address
    if (!user.address_info.includes(addressId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this address' });
    }

    // Remove address from user's address_info array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { address_info: addressId } },
      { new: true }
    );

    // Delete the address
    await Address.findByIdAndDelete(addressId);

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get address by ID
export const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    // Find the address
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Check if user owns this address or is admin
    if (req.user.role !== 'admin') {
      const user = await User.findById(userId);
      if (!user.address_info.includes(addressId)) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this address' });
      }
    }

    return res.status(200).json({
      success: true,
      address
    });
  } catch (error) {
    console.error('Get address by ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};