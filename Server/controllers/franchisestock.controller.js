import FranchiseStock from '../model/franchisestock.model.js';
import Franchise from '../model/franchise.model.js';
import Product from '../model/product.model.js';

// Add or update product stock in a franchise
export const updateFranchiseStock = async (req, res) => {
  try {
    const { franchiseId, productId } = req.params;
    const { quantity, isAddition = true } = req.body;

    // Validate inputs
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required' });
    }

    // Check if franchise exists
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find existing stock or create new one
    let franchiseStock = await FranchiseStock.findOne({
      franchise: franchiseId,
      product: productId
    });

    if (franchiseStock) {
      // Update existing stock
      try {
        await franchiseStock.updateStock(quantity, isAddition);
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
    } else {
      // Create new stock entry
      if (!isAddition) {
        return res.status(400).json({ success: false, message: 'Cannot subtract from non-existent stock' });
      }

      franchiseStock = await FranchiseStock.create({
        franchise: franchiseId,
        product: productId,
        quantity: quantity
      });
    }

    // Populate for response
    const populatedStock = await FranchiseStock.findById(franchiseStock._id)
      .populate('product', 'name price')
      .populate('franchise', 'name location');

    return res.status(200).json({
      success: true,
      message: 'Franchise stock updated successfully',
      franchiseStock: populatedStock
    });
  } catch (error) {
    console.error('Update franchise stock error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all stock for a specific franchise
export const getFranchiseStock = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const { lowStock, search } = req.query;

    // Check if franchise exists
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    // Build query
    const query = { franchise: franchiseId };
    
    // Add low stock filter if requested
    if (lowStock === 'true') {
      // Join with products to get low stock threshold
      const stockItems = await FranchiseStock.find(query)
        .populate('product', 'lowStockThreshold');
      
      // Filter items with quantity below threshold
      const lowStockItems = stockItems.filter(item => 
        item.quantity <= (item.product.lowStockThreshold || 10)
      );
      
      // Return only the IDs of low stock items
      const lowStockIds = lowStockItems.map(item => item._id);
      query._id = { $in: lowStockIds };
    }

    // Get stock with populated product details
    let stockItems = await FranchiseStock.find(query)
      .populate('product', 'name price image lowStockThreshold')
      .populate('franchise', 'name location');

    // Apply search filter if provided
    if (search) {
      stockItems = stockItems.filter(item => 
        item.product.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return res.status(200).json({
      success: true,
      franchise: {
        _id: franchise._id,
        name: franchise.name,
        location: franchise.location
      },
      stockItems,
      totalItems: stockItems.length
    });
  } catch (error) {
    console.error('Get franchise stock error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get stock for a specific product across all franchises
export const getProductStockAcrossFranchises = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get stock across all franchises
    const stockItems = await FranchiseStock.find({ product: productId })
      .populate('franchise', 'name location')
      .sort({ quantity: -1 }); // Sort by quantity descending

    // Calculate total stock across all franchises
    const totalStock = stockItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      success: true,
      product: {
        _id: product._id,
        name: product.name
      },
      stockItems,
      totalStock,
      franchiseCount: stockItems.length
    });
  } catch (error) {
    console.error('Get product stock across franchises error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get stock for a specific product in a specific franchise
export const getProductStockInFranchise = async (req, res) => {
  try {
    const { franchiseId, productId } = req.params;

    // Check if franchise exists
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get stock
    const stockItem = await FranchiseStock.findOne({
      franchise: franchiseId,
      product: productId
    });

    if (!stockItem) {
      return res.status(200).json({
        success: true,
        message: 'No stock found for this product in this franchise',
        stockItem: {
          franchise: {
            _id: franchise._id,
            name: franchise.name
          },
          product: {
            _id: product._id,
            name: product.name
          },
          quantity: 0,
          lastUpdated: null
        }
      });
    }

    // Populate for response
    const populatedStock = await FranchiseStock.findById(stockItem._id)
      .populate('product', 'name price image')
      .populate('franchise', 'name location');

    return res.status(200).json({
      success: true,
      stockItem: populatedStock
    });
  } catch (error) {
    console.error('Get product stock in franchise error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete stock entry (admin only)
export const deleteStockEntry = async (req, res) => {
  try {
    const { stockId } = req.params;

    const stockItem = await FranchiseStock.findById(stockId);
    if (!stockItem) {
      return res.status(404).json({ success: false, message: 'Stock entry not found' });
    }

    await FranchiseStock.findByIdAndDelete(stockId);

    return res.status(200).json({
      success: true,
      message: 'Stock entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete stock entry error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get low stock items across all franchises
export const getLowStockItems = async (req, res) => {
  try {
    // Get all stock items with populated product details
    const allStockItems = await FranchiseStock.find()
      .populate('product', 'name price image lowStockThreshold')
      .populate('franchise', 'name location');

    // Filter items with quantity below threshold
    const lowStockItems = allStockItems.filter(item => 
      item.quantity <= (item.product.lowStockThreshold || 10)
    );

    return res.status(200).json({
      success: true,
      lowStockItems,
      totalItems: lowStockItems.length
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
