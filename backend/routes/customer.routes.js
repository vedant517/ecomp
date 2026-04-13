import express from "express";
const router = express.Router();
import {
  getCustomerStats,
  getAllCustomers,
  getCustomerById
} from "../controllers/customer.controller.js";

// Dashboard stats
router.get("/stats", getCustomerStats);

// Customer table
router.get("/", getAllCustomers);

// Single customer
router.get("/:userId", getCustomerById);

export default router;
