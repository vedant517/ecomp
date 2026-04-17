import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:     String,
  image:    String,
  price:    Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items:         [orderItemSchema],
    address:       { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    totalAmount:   { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    status:        { type: String, default: "pending" },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// ── POST /api/orders  — place a new order ─────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const { items, address, totalAmount, paymentMethod } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items in order." });

    const order = await Order.create({
      user: req.user._id,
      items,
      address,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error("Place order error:", err.message);
    res.status(500).json({ message: "Server error placing order." });
  }
});

// ── GET /api/orders/my-orders  — get current user's orders ────────────────────
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("address");

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ message: "Server error fetching orders." });
  }
});

// ── GET /api/orders/:id  — get single order ───────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,       // ensures user can only see their own orders
    }).populate("address");

    if (!order)
      return res.status(404).json({ message: "Order not found." });

    res.json({ success: true, data: order });
  } catch (err) {
    console.error("Get order error:", err.message);
    res.status(500).json({ message: "Server error fetching order." });
  }
});

export default router;
