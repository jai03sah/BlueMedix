import Category from '../model/category.model.js';
import Product from '../model/product.model.js';

// Create a new category (admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    // Create new category
    const category = await Category.create({
      name,
      image: image || ""
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const { sort = 'name', order = 'asc' } = req.query;
    
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    const categories = await Category.find().sort(sortOptions);
    
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    return res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update category (admin only)
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, image } = req.body;
    
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Check if new name already exists (if name is being updated)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: categoryId }
      });
      
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Category with this name already exists' });
      }
      
      category.name = name;
    }
    
    if (image !== undefined) {
      category.image = image;
    }
    
    await category.save();
    
    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete category (admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Check if category is being used by any products
    const productsUsingCategory = await Product.countDocuments({ category: categoryId });
    if (productsUsingCategory > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category. It is associated with ${productsUsingCategory} products.` 
      });
    }
    
    await Category.findByIdAndDelete(categoryId);
    
    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get products count by category
export const getProductsCountByCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    
    const result = await Promise.all(categories.map(async (category) => {
      const count = await Product.countDocuments({ 
        category: category._id,
        publish: true
      });
      
      return {
        _id: category._id,
        name: category.name,
        image: category.image,
        productsCount: count
      };
    }));
    
    return res.status(200).json({
      success: true,
      categoriesWithCount: result
    });
  } catch (error) {
    console.error('Get products count by category error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};