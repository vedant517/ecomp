import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Routes
import productRoutes from './routes/productRoutes.js';
import configRoutes from './routes/configRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import subcategoryRoutes from './routes/subcategoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userOrderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import customerRoutes from './routes/customer.routes.js';
import Address from "./routes/address.routes.js";


// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(helmet());
app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'));
app.use(compression());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/config', configRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/customers', customerRoutes);
app.use("/api/addresses", Address);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(`[Error] ${req.method} ${req.url}: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

const PORT = process.env.PORT || 5000;

// Start DB before server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(false, () => {
    console.log('Mongo connection closed.');
    process.exit(0);
  });
});
