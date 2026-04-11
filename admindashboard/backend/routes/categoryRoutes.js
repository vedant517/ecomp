const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
  createSubcategory,
  deleteSubcategory,
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Categories
router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategory);

router.route('/:id')
  .put(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

// Subcategories
router.route('/subcategories')
  .get(getSubcategories)
  .post(protect, authorize('admin'), createSubcategory);

router.route('/subcategories/:id')
  .delete(protect, authorize('admin'), deleteSubcategory);

router.route('/:categoryId/subcategories')
  .get(getSubcategories);

module.exports = router;
