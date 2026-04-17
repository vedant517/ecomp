import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';

// ================== CATEGORY ==================

// 👉 Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 👉 Create category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    // ✅ Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    // ✅ Slug generate
    const slug = name ? name.toLowerCase().trim().split(' ').join('-') : "";

    // ✅ Check duplicate
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      name,
      description,
      image,
      slug
    });

    res.status(201).json({
      success: true,
      data: category
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 👉 Update category
export const updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // ✅ Update slug if name changes
    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().trim().split(' ').join('-');
    }

    if (req.file) {
      req.body.image = req.file.path;
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 👉 Delete category + its subcategories
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // ✅ Delete related subcategories
    await Subcategory.deleteMany({ category: req.params.id });

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



// ================== SUBCATEGORY ==================

// 👉 Get subcategories
export const getSubcategories = async (req, res) => {
  try {
    let query;

    if (req.params.categoryId) {
      query = Subcategory.find({ category: req.params.categoryId })
        .populate('category', 'name');
    } else {
      query = Subcategory.find()
        .populate('category', 'name');
    }

    const subcategories = await query;

    res.status(200).json({
      success: true,
      count: subcategories.length,
      data: subcategories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 👉 Create subcategory
export const createSubcategory = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    // ✅ Validation
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required"
      });
    }

    // ✅ Check parent category
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found"
      });
    }

    // ✅ Slug
    const slug = name.toLowerCase().trim().split(' ').join('-');

    let subcategory = await Subcategory.create({
      name,
      description,
      category,
      image,
      slug
    });

    subcategory = await subcategory.populate('category', 'name');

    res.status(201).json({
      success: true,
      data: subcategory
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 👉 Update subcategory
export const updateSubcategory = async (req, res) => {
  try {
    let subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found"
      });
    }

    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().trim().split(' ').join('-');
    }

    if (req.file) {
      req.body.image = req.file.path;
    }

    subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: subcategory
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 👉 Delete subcategory
export const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found"
      });
    }

    await subcategory.deleteOne();

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};