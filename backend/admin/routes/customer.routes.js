import express from "express";
import * as customerController from "../controllers/customer.controller.js";

const router = express.Router();

//  Dashboard stats
router.get("/stats", customerController.getCustomerStats);

//  Customer table
router.get("/", customerController.getAllCustomers);

//  Single customer
router.get("/:userId", customerController.getCustomerById);

export default router;