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

const router = express.Router();

// Get subcategories for a specific category (nested route)
router.route('/:categoryId/subcategories')
  .get(getSubcategories);

// Subcategory Routes (More specific routes first)
router.route('/subcategories')
  .get(getSubcategories)
  .post(protect, authorize('admin'), createSubcategory);

router.route('/subcategories/:id')
  .put(protect, authorize('admin'), updateSubcategory)
  .delete(protect, authorize('admin'), deleteSubcategory);

// Category Routes
router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategory);

router.route('/:id')
  .put(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

export default router;
