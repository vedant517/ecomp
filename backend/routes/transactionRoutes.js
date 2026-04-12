import express from 'express';
import {
  getTransactions,
  getTransactionById,
  getTransactionStats,
  refundTransaction,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public GET routes for testing
router.get('/', getTransactions);
router.get('/stats', getTransactionStats);
router.get('/:id', getTransactionById);

// Admin-only write routes
router.post('/:id/refund', protect, authorize('admin'), refundTransaction);

export default router;
