// controllers/order.controller.js
const Order = require("../models/order.model");

// ✅ GET ALL ORDERS (TRACK)
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE ORDER STATUS (MANAGE)
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ ORDER STATS (DASHBOARD)
exports.getOrderStats = async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: "Pending" });
    const delivered = await Order.countDocuments({ status: "Delivered" });
    const cancelled = await Order.countDocuments({ status: "Cancelled" });

    res.json({
      success: true,
      total,
      pending,
      delivered, 
      cancelled
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};