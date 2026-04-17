import express from 'express';
const router = express.Router();
import {
  getSubcategories,
  getSubcategoryById,
  getSubcategoriesByCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/subcategoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/')
  .get(getSubcategories)
  .post(protect, authorize('admin'), createSubcategory);

router.route('/:id')
  .get(getSubcategoryById)
  .put(protect, authorize('admin'), updateSubcategory)
  .delete(protect, authorize('admin'), deleteSubcategory);

router.route('/category/:categoryId')
  .get(getSubcategoriesByCategory);

export default router;
