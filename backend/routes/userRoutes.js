import express from "express";
import {
  createOrder,
  getUserOrders,
  cancelOrder
} from "../controllers/userOrderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/orders", protect, createOrder);
router.get("/orders", protect, getUserOrders);
router.put("/orders/:orderId", protect, cancelOrder);

export default router;
