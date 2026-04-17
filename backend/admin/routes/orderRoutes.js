import express from "express";
import {
  getOrders,
  updateOrder,
  getOrderStats
} from "../controllers/orderController.js";
import { createOrder } from "../controllers/userOrderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Order creation and list
router.route("/")
  .get(getOrders)
  .post(protect, createOrder);

router.get("/stats", getOrderStats);

// Admin-only write routes
router.put("/:orderId", protect, authorize('admin'), updateOrder);

export default router;
