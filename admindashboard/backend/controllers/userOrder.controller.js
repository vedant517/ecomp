// controllers/userOrder.controller.js
const Order = require("../models/order.model");

// ✅ CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      orderId: "#ORD" + Date.now(),
      userId: req.user?.id || "guest",
      ...req.body,
      status: "Pending"
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET USER ORDERS
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user?.id });

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ CANCEL ORDER (USER)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, userId: req.user?.id },
      { status: "Cancelled" },
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