import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Admin from './models/Admin.js';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    
    const orderCount = await Order.countDocuments();
    const adminCount = await Admin.countDocuments();
    
    console.log('--- DATABASE STATS ---');
    console.log('Orders:', orderCount);
    console.log('Admins/Users:', adminCount);
    
    if (orderCount > 0) {
      const sampleOrder = await Order.findOne();
      console.log('Sample Order:', sampleOrder.orderId);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkData();
