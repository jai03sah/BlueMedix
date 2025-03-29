import Product from '../model/product.model.js';
import Category from '../model/category.model.js';

// Create a new product (admin only)
export const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      price, 
      discount, 
      warehouseStock, 
      lowStockThreshold, 
      image, 
      manufacturer,
      publish
    } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Create new product
    const product = await Product.create({
      name,
      description,
      category,
      price,
      discount: discount || 0,
      warehouseStock: warehouseStock || 0,
      lowStockThreshold: lowStockThreshold || 10,
      image: image || [],
      manufacturer,
      publish: publish !== undefined ? publish : true
    });

    // Populate category for response
    const populatedProduct = await Product.findById(product._id).populate('category', 'name');

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    // Parse query parameters for filtering
    const { 
      category, 
      minPrice, 
      maxPrice, 
      publish,
      manufacturer,
      search,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (publish !== undefined) filter.publish = publish === 'true';
    if (manufacturer) filter.manufacturer = manufacturer;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);

    return res.status(200).json({ 
      success: true, 
      products,
      pagination: {
        total: totalProducts,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalProducts / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate('category', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Get product by ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      name, 
      description, 
      category, 
      price, 
      discount, 
      warehouseStock, 
      lowStockThreshold, 
      image, 
      manufacturer,
      publish
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if category exists if it's being updated
    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;
    if (discount !== undefined) product.discount = discount;
    if (warehouseStock !== undefined) product.warehouseStock = warehouseStock;
    if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;
    if (image) product.image = image;
    if (manufacturer) product.manufacturer = manufacturer;
    if (publish !== undefined) product.publish = publish;

    await product.save();

    // Populate category for response
    const updatedProduct = await Product.findById(productId).populate('category', 'name');

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update product stock (admin or manager)
export const updateProductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { warehouseStock } = req.body;

    if (warehouseStock === undefined) {
      return res.status(400).json({ success: false, message: 'Warehouse stock is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.warehouseStock = warehouseStock;
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      product: {
        _id: product._id,
        name: product.name,
        warehouseStock: product.warehouseStock
      }
    });
  } catch (error) {
    console.error('Update product stock error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const products = await Product.find({ 
      category: categoryId,
      publish: true
    }).populate('category', 'name');

    return res.status(200).json({ 
      success: true, 
      category: categoryExists.name,
      products
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};