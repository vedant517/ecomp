import Order from "../models/Order.js";
import Product from "../models/Product.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { orderItems } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Update stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty }
      });
    }

    const orderData = {
      orderId: "#ORD" + Date.now(),
      ...req.body,
      status: "Pending"
    };

    if (req.user?.id) {
      orderData.user = req.user.id;
    }

    const order = await Order.create(orderData);

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
    const order = await Order.findOne({ orderId: req.params.orderId, user: req.user?.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.qty }
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
