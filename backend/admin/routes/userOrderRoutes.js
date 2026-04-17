import express from "express";
import {
  createOrder,
  getUserOrders,
  cancelOrder
} from "../controllers/userOrderController.js";


const router = express.Router();

router.post("/orders", createOrder);
router.get("/orders", getUserOrders);
router.put("/orders/:orderId", cancelOrder);

export default router;
