const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const ordersRoute = require("./routes/order.routes");
const connectDB = require("./config/db");

// Load env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/api/user", require("./routes/userroutes"));
app.use("/api/orders", require("./routes/order.routes"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
app.use("/api/admin", require("./routes/AdminRoutes"));
app.use("/api/orders", ordersRoute);
// Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ msg: err.message || "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});