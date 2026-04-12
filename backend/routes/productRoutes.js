import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Support both single "image" and multiple "images"
const uploadMiddleware = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), uploadMiddleware, createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), uploadMiddleware, updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

export default router;
