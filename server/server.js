const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: __dirname + "/.env" });

const app = express();

// ==============================
// ✅ Middlewares
// ==============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3000",
  "http://localhost:3001",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// ==============================
// ✅ Routes
// ==============================
app.use("/api/auth", (req, res, next) => {
  console.log(`[AUTH-DEBUG] ${req.method} ${req.url} | Body:`, req.body);
  next();
}, require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/addresses", require("./routes/addressRoutes"));
app.use("/api/shipping", require("./routes/shippingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/offers", require("./routes/offerRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// ==============================
// ✅ 404 Handler
// ==============================
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ==============================
// ✅ Global Error Handler
// ==============================
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ==============================
// ✅ MongoDB Connection & Server Start
// ==============================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
      console.log("⚠️ Continuing without MongoDB (demo mode enabled)");
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});