// routes/user.routes.js
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  cancelOrder
} = require("../controllers/userOrder.controller");

const { protect } = require("../middleware/auth.middleware");

router.post("/orders", protect, createOrder);
router.get("/orders", protect, getUserOrders);
router.put("/orders/:orderId", protect, cancelOrder);

module.exports = router;