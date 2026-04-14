import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const generateToken = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    const admin = await Admin.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      console.log('Admin not found. Please run npm run seed first.');
      process.exit(1);
    }

    const token = jwt.sign(
      { id: admin._id.toString(), role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('\n--- ADMIN TOKEN FOR POSTMAN ---');
    console.log(token);
    console.log('-------------------------------\n');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

generateToken();
