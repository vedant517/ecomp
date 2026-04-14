import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Get subcategories for a specific category (nested route)
router.route('/:categoryId/subcategories')
  .get(getSubcategories);

// Subcategory Routes (More specific routes first)
router.route('/subcategories')
  .get(getSubcategories)
  .post(protect, authorize('admin'), upload.single('image'), createSubcategory);

router.route('/subcategories/:id')
  .put(protect, authorize('admin'), upload.single('image'), updateSubcategory)
  .delete(protect, authorize('admin'), deleteSubcategory);

// Category Routes
router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), upload.single('image'), createCategory);

router.route('/:id')
  .put(protect, authorize('admin'), upload.single('image'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

export default router;
