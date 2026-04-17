import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import dns from "dns";

// Force DNS (fix Mongo SRV error)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

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
import userRoutes from "./admin/routes/userOrderRoutes.js";
import paymentRoutes from "./admin/routes/paymentRoutes.js";
import transactionRoutes from "./admin/routes/transactionRoutes.js";
import customerRoutes from "./admin/routes/customer.routes.js";
import addressRoutes from "./admin/routes/address.routes.js";
import offerRoutes from "./admin/routes/offerRoutes.js";
import adminProfileRoutes from "./admin/routes/adminProfile.routes.js";
import shippingRoutes from "./admin/routes/shippingRoutes.js";

// ==============================
// ✅ USER ROUTES (Converted)
// ==============================
import authRoutes from "./User/routes/authRoutes.js";
import cartRoutes from "./User/routes/cartRoutes.js";
import wishlistRoutes from "./User/routes/wishlistRoutes.js";
import userOrderRoutes from "./User/routes/orderRoutes.js";
import reviewRoutes from "./User/routes/reviewRoutes.js";

// ==============================
// ✅ ROUTE MAPPING
// ==============================

// Admin APIs
app.use("/api/products", productRoutes);
app.use("/api/config", configRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/shipping", shippingRoutes);

// User APIs
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/user/orders", userOrderRoutes);
app.use("/api/reviews", reviewRoutes);

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

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

// ==============================
// ✅ DATABASE CONNECTION
// ==============================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    return false;
  }
};

const PORT = process.env.PORT || 5000;

// ==============================
// ✅ START SERVER
// ==============================
connectDB().then((isConnected) => {
  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else {
    process.exit(1);
  }
});

// ==============================
// ✅ GRACEFUL SHUTDOWN
// ==============================
process.on("SIGTERM", () => {
  mongoose.connection.close(false, () => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});