import express from "express";
import { protect as userProtect } from "../middleware/authMiddleware.js";
import { 
  getOrders, 
  updateOrder, 
  getOrderStats 
} from "../../admin/controllers/orderController.js";
import { protect as adminProtect, authorize } from "../../admin/middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post("/", userProtect, async (req, res) => {
  try {
    const {
      items,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      totalAmount,
      couponCode,
    } = req.body;

    // Validate items - accept both items and orderItems
    const finalItems = items || orderItems || [];

    if (!finalItems || finalItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in order.",
      });
    }

    // Generate a unique orderId for Admin Panel compatibility
    const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Map items to match the new synchronized schema
    const mappedItems = finalItems.map((item) => ({
      product: item.product || item.productId || item._id,
      productId: item.productId || item.product || item._id,
      name: item.name,
      image: item.image,
      price: parseFloat(item.price || 0),
      qty: parseInt(item.quantity || item.qty || 1),
      variant: item.variant || (item.selectedVariant ? `${item.selectedVariant.name}: ${item.selectedVariant.value}` : ""),
    }));

    // Handle both totalAmount and totalPrice field names
    const finalTotalPrice = totalPrice || totalAmount || 0;

    // Normalize shipping address for Admin compatibility
    const finalShippingAddress = {
      fullName: shippingAddress?.fullName || shippingAddress?.name || "Customer",
      address: shippingAddress?.address || shippingAddress?.addressLine || "Not provided",
      city: shippingAddress?.city || "Not provided",
      postalCode: shippingAddress?.postalCode || shippingAddress?.pincode || "Not provided",
      country: shippingAddress?.country || "India",
      phone: shippingAddress?.phone || "Not provided",
    };

    // Handle Coupon usage
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        // Basic safety check (even if frontend already validated)
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          appliedCoupon = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
          };
          
          // Record usage
          await Coupon.findByIdAndUpdate(coupon._id, {
            $inc: { usedCount: 1 },
            $push: { usedBy: req.user._id }
          });
        }
      }
    }

    // Create order
    const order = await Order.create({
      orderId,
      user: req.user._id,
      orderItems: mappedItems,
      shippingAddress: finalShippingAddress,
      itemsPrice: itemsPrice || 0,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice: finalTotalPrice,
      paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay",
      status: "Pending", // Use capitalized for Admin compatibility
      paymentStatus: paymentMethod === "online" || paymentMethod === "Razorpay" ? "pending" : "cod",
      coupon: appliedCoupon, // Track which coupon was used
    });

    // Decrement product stock
    try {
      for (const item of mappedItems) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.qty, sold: item.qty },
          });
        }
      }
    } catch (err) {
      console.error("Stock update error:", err.message);
    }

    // Clear user's cart after successful order
    try {
      await Cart.deleteMany({ userId: req.user._id });
    } catch (err) {
      console.warn("Could not clear cart:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (err) {
    console.error("Place order error:", err);
    res.status(500).json({
      success: false,
      message: "Server error placing order.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// ── GET /api/orders/my-orders  — get current user's orders ────────────────────
router.get("/my-orders", userProtect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ message: "Server error fetching orders." });
  }
});

// ── GET /api/orders/:id  — get single order ───────────────────────────────────
router.get("/:id", userProtect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,       // ensures user can only see their own orders
    });

    if (!order)
      return res.status(404).json({ message: "Order not found." });

    res.json({ success: true, data: order });
  } catch (err) {
    console.error("Get order error:", err.message);
    res.status(500).json({ message: "Server error fetching order." });
  }
});

// ==============================
// ✅ ADMIN ROUTES (Management)
// ==============================

// Get all orders (Admin)
router.get("/all", adminProtect, authorize('admin'), getOrders);

// Get order stats (Admin)
router.get("/stats", adminProtect, authorize('admin'), getOrderStats);

// Update order status (Admin)
router.put("/:orderId", adminProtect, authorize('admin'), updateOrder);

export default router;
