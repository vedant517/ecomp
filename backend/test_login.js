import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './admin/models/Admin.js';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'admin@gmail.com';
    const password = 'admin123';
    
    const admin = await Admin.findOne({ email }).lean();
    if (!admin) {
      console.log('Admin not found');
      return;
    }

    console.log('Admin found:', admin.email);
    console.log('Stored hash:', admin.password);

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('Password match:', isMatch);

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
};

testLogin();
