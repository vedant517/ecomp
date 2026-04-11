const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// Get list of all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new category 
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const slug = name.toLowerCase().split(' ').join('-');
    
    const category = await Category.create({ 
      name, 
      description, 
      image,
      slug 
    });
    
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update existing category
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().split(' ').join('-');
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete category and its subcategories
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Clean up subcategories first
    await Subcategory.deleteMany({ category: req.params.id });
    await category.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get subcategories (optionally filtered by category ID)
exports.getSubcategories = async (req, res) => {
  try {
    let query;
    if (req.params.categoryId) {
      query = Subcategory.find({ category: req.params.categoryId }).populate('category', 'name');
    } else {
      query = Subcategory.find().populate('category', 'name');
    }

    const subcategories = await query;
    res.status(200).json({ success: true, count: subcategories.length, data: subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new subcategory
exports.createSubcategory = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: 'Request body is empty' });
    }

    const { name, description, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Please provide name and category ID' });
    }

    const slug = name.toLowerCase().split(' ').join('-');
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'Parent category not found' });
    }

    let subcategory = await Subcategory.create({ 
      name, 
      description, 
      category,
      slug 
    });
    
    subcategory = await subcategory.populate('category', 'name');
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Remove subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    await subcategory.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
