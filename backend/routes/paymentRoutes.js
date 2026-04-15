import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey,
} from '../controllers/paymentController.js';
// Authorization middleware is intentionally removed for public payment flow

const router = express.Router();

// Public - get Razorpay key for frontend
router.get('/key', getRazorpayKey);

// Protected - create order & verify payment
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

export default router;
