import express from "express";
import {
  getOrders,
  updateOrder,
  getOrderStats
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public GET routes (no auth needed for testing)
router.get("/", getOrders);
router.get("/stats", getOrderStats);

// Admin-only write routes
router.put("/:orderId", protect, authorize('admin'), updateOrder);

export default router;
