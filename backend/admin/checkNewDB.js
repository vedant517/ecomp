import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import User from './models/User.js';

import dotenv from 'dotenv';
dotenv.config();

const checkNewDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const adminCount = await Admin.countDocuments();
    const userCount = await User.countDocuments();
    console.log('--- NEW DB AUDIT ---');
    console.log('Admins:', adminCount);
    console.log('Users:', userCount);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkNewDB();
