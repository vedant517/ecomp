import express from "express";
import {
  getProfile,
  updateProfile,
  updatePassword,
} from "../controllers/adminProfile.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",          protect, getProfile);
router.put("/",          protect, updateProfile);
router.put("/password",  protect, updatePassword);

export default router;