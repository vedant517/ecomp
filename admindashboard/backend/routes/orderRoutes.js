// routes/order.routes.js
const express = require("express");
const router = express.Router();

const {
  getOrders,
  updateOrder,
  getOrderStats
} = require("../controllers/order.controller");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// 🔐 Admin only
router.use(protect, isAdmin);

// TRACK
router.get("/", getOrders);

// DASHBOARD
router.get("/stats", getOrderStats);

// MANAGE (update status)
router.put("/:orderId", updateOrder);

module.exports = router;