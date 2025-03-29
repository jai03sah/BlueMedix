import Cart from '../model/cart.model.js';
import Product from '../model/product.model.js';
import Franchise from '../model/franchise.model.js';

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, franchiseId } = req.body;
    const userId = req.user._id; // Assuming user is attached from auth middleware

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate franchise if provided
    if (franchiseId) {
      const franchise = await Franchise.findById(franchiseId);
      if (!franchise) {
        return res.status(404).json({ success: false, message: 'Franchise not found' });
      }
    }

    // Check if item already exists in cart
    const existingCartItem = await Cart.findOne({
      user_id: userId,
      productid: productId,
      franchise: franchiseId || null
    });

    if (existingCartItem) {
      // Update quantity if item exists
      existingCartItem.quantity += quantity || 1;
      await existingCartItem.save();

      return res.status(200).json({
        success: true,
        message: 'Cart updated successfully',
        cartItem: existingCartItem
      });
    } else {
      // Create new cart item
      const newCartItem = await Cart.create({
        user_id: userId,
        productid: productId,
        quantity: quantity || 1,
        franchise: franchiseId || null
      });

      // Populate product details for response
      const populatedCartItem = await Cart.findById(newCartItem._id)
        .populate('productid', 'name price image')
        .populate('franchise', 'name location');

      return res.status(201).json({
        success: true,
        message: 'Item added to cart successfully',
        cartItem: populatedCartItem
      });
       
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user's cart
export const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is attached from auth middleware

    const cartItems = await Cart.find({ user_id: userId })
      .populate('productid', 'name price image discount')
      .populate('franchise', 'name location');

    // Calculate total price
    let totalPrice = 0;
    cartItems.forEach(item => {
      const productPrice = item.productid.price;
      const discountedPrice = productPrice - (productPrice * (item.productid.discount || 0) / 100);
      totalPrice += discountedPrice * item.quantity;
    });

    return res.status(200).json({
      success: true,
      cartItems,
      totalItems: cartItems.length,
      totalPrice: parseFloat(totalPrice.toFixed(2))
    });
  } catch (error) {
    console.error('Get user cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id; // Assuming user is attached from auth middleware

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cartItem = await Cart.findOne({
      _id: cartItemId,
      user_id: userId
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    // Populate product details for response
    const updatedCartItem = await Cart.findById(cartItemId)
      .populate('productid', 'name price image discount')
      .populate('franchise', 'name location');

    return res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cartItem: updatedCartItem
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user._id; // Assuming user is attached from auth middleware

    const cartItem = await Cart.findOne({
      _id: cartItemId,
      user_id: userId
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    await Cart.findByIdAndDelete(cartItemId);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Clear user's cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is attached from auth middleware

    await Cart.deleteMany({ user_id: userId });

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
