import Order from "../models/Order.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      orderId: "#ORD" + Date.now(),
      user: req.user?.id || "guest",
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

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user?.id });

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CANCEL ORDER (USER)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, user: req.user?.id },
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
