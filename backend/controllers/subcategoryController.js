import Subcategory from '../models/Subcategory.js';
import asyncHandler from 'express-async-handler';
import slugify from 'slugify';

// @desc    Get all subcategories
// @route   GET /api/subcategories
// @access  Public
export const getSubcategories = asyncHandler(async (req, res) => {
  const subcategories = await Subcategory.find({}).populate('category', 'name');
  res.status(200).json({
    success: true,
    count: subcategories.length,
    data: subcategories
  });
});

// @desc    Get subcategories by category
// @route   GET /api/subcategories/category/:categoryId
// @access  Public
export const getSubcategoriesByCategory = asyncHandler(async (req, res) => {
  const subcategories = await Subcategory.find({ category: req.params.categoryId });
  res.status(200).json({
    success: true,
    count: subcategories.length,
    data: subcategories
  });
});

// @desc    Get single subcategory
// @route   GET /api/subcategories/:id
// @access  Public
export const getSubcategoryById = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id).populate('category', 'name');
  if (subcategory) {
    res.status(200).json({ success: true, data: subcategory });
  } else {
    res.status(404);
    throw new Error('Subcategory not found');
  }
});

// @desc    Create a subcategory
// @route   POST /api/subcategories
// @access  Private/Admin
export const createSubcategory = asyncHandler(async (req, res) => {
  const { name, category, description } = req.body;

  const subcategoryExists = await Subcategory.findOne({ name, category });

  if (subcategoryExists) {
    res.status(400);
    throw new Error('Subcategory already exists for this category');
  }

  const subcategory = await Subcategory.create({
    name,
    slug: slugify(name, { lower: true }),
    category,
    description,
  });

  if (subcategory) {
    res.status(201).json({ success: true, data: subcategory });
  } else {
    res.status(400);
    throw new Error('Invalid subcategory data');
  }
});

// @desc    Update a subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
export const updateSubcategory = asyncHandler(async (req, res) => {
  const { name, category, description } = req.body;

  const subcategory = await Subcategory.findById(req.params.id);

  if (subcategory) {
    subcategory.name = name || subcategory.name;
    subcategory.category = category || subcategory.category;
    subcategory.description = description || subcategory.description;
    
    if (name) {
      subcategory.slug = slugify(name, { lower: true });
    }

    const updatedSubcategory = await subcategory.save();
    res.status(200).json({ success: true, data: updatedSubcategory });
  } else {
    res.status(404);
    throw new Error('Subcategory not found');
  }
});

// @desc    Delete a subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
export const deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);

  if (subcategory) {
    await subcategory.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } else {
    res.status(404);
    throw new Error('Subcategory not found');
  }
});
