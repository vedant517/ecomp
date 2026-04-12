import Order from "../models/Order.js";

// GET ALL ORDERS
export const getOrders = async (req, res) => {
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

// UPDATE ORDER STATUS
export const updateOrder = async (req, res) => {
  try {
    // The dashboard uses orderId (custom string) but if it's MongoDB ID, adapt
    let order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      req.body,
      { new: true }
    );

    if (!order) {
      // Try by MongoDB ID if custom orderId doesn't match
      order = await Order.findByIdAndUpdate(req.params.orderId, req.body, { new: true });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ORDER STATS
export const getOrderStats = async (req, res) => {
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
