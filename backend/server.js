import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

// Load env
dotenv.config();

const app = express();

// ==============================
// ✅ MIDDLEWARES
// ==============================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(helmet());
app.use(process.env.NODE_ENV === "production" ? morgan("combined") : morgan("dev"));
app.use(compression());

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==============================
// ✅ ADMIN ROUTES
// ==============================
import productRoutes from "./admin/routes/productRoutes.js";
import configRoutes from "./admin/routes/configRoutes.js";
import categoryRoutes from "./admin/routes/categoryRoutes.js";
import brandRoutes from "./admin/routes/brandRoutes.js";
import subcategoryRoutes from "./admin/routes/subcategoryRoutes.js";
import adminRoutes from "./admin/routes/adminRoutes.js";
import orderRoutes from "./admin/routes/orderRoutes.js";
import paymentRoutes from "./admin/routes/paymentRoutes.js";
import transactionRoutes from "./admin/routes/transactionRoutes.js";
import customerRoutes from "./admin/routes/customer.routes.js";
import addressRoutes from "./admin/routes/address.routes.js";
import offerRoutes from "./admin/routes/offerRoutes.js";
import adminProfileRoutes from "./admin/routes/adminProfile.routes.js";
import shippingRoutes from "./admin/routes/shippingRoutes.js";
import couponRoutes from "./admin/routes/Couponroutes.js";



// ==============================
// ✅ USER ROUTES (Migrated from 'server' folder)
// ==============================
import authRoutes from "./User/routes/authRoutes.js";
import cartRoutes from "./User/routes/cartRoutes.js";
import wishlistRoutes from "./User/routes/wishlistRoutes.js";
import userOrderRoutes from "./User/routes/orderRoutes.js"; // New order routes from 'server'
import userProductRoutes from "./User/routes/productRoutes.js";
import userCategoryRoutes from "./User/routes/categoryRoutes.js";
import userAddressRoutes from "./User/routes/addressRoutes.js";
import userCouponRoutes from "./User/routes/couponRoutes.js";
import userOfferRoutes from "./User/routes/offerRoutes.js";
import userPaymentRoutes from "./User/routes/paymentRoutes.js";
import userShippingRoutes from "./User/routes/shippingRoutes.js";
import userRoutes from "./User/routes/userRoutes.js";
import reviewRoutes from "./User/routes/reviewRoutes.js";

// ==============================
// ✅ ROUTE MAPPING (Unified)
// ==============================

// Main Unified Routes (User + Admin)
app.use("/api/products", userProductRoutes);
app.use("/api/categories", userCategoryRoutes);
app.use("/api/orders", userOrderRoutes);
app.use("/api/addresses", userAddressRoutes);
app.use("/api/coupons", userCouponRoutes);
app.use("/api/offers", userOfferRoutes);
app.use("/api/payments", userPaymentRoutes);
app.use("/api/shipping", userShippingRoutes);

// User-Specific Routes
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/user", userRoutes);
app.use("/api/reviews", reviewRoutes);

// Admin-Specific Routes
app.use("/api/config", configRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/subcategories", subcategoryRoutes);

// ==============================
// ✅ HEALTH CHECK
// ==============================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("Unified API is running...");
});

// ==============================
// ✅ ERROR HANDLING
// ==============================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}: ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});


// ==============================
// ✅ DATABASE CONNECTION
// ==============================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
    });

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });
    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected.");
    });
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    return true;
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    return false;
  }
};

const PORT = process.env.PORT || 5001;



connectDB().then((isConnected) => {
  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else {
    process.exit(1);
  }
});


process.on("SIGTERM", () => {
  mongoose.connection.close(false, () => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});