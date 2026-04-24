const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/Order");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order
// @access  Private
router.post("/create-order", protect, async (req, res) => {
  try {
    const { amount, currency = "INR", orderId } = req.body;
    console.log(`[RAZORPAY-DEBUG] Creating order. Received Amount: ${amount}`);

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount), // amount in smallest currency unit (paise)
      currency,
      receipt: orderId || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
    }

    res.json(order);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature
// @access  Private
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret");

    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment verified
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "completed",
          paymentResult: {
            id: razorpay_payment_id,
            status: "completed",
            update_time: Date.now().toString(),
          },
          isPaid: true,
          paidAt: Date.now(),
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
        });
      }
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Razorpay verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
