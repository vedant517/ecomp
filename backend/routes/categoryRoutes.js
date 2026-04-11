import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
  createSubcategory,
  deleteSubcategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Category Routes
router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategory);

router.route('/:id')
  .put(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

// Subcategory Routes
router.route('/subcategories')
  .get(getSubcategories)
  .post(protect, authorize('admin'), createSubcategory);

router.route('/subcategories/:id')
  .delete(protect, authorize('admin'), deleteSubcategory);

// Get subcategories for a specific category
router.route('/:categoryId/subcategories')
  .get(getSubcategories);

export default router;
