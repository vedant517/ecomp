import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

await mongoose.connect(process.env.MONGODB_URI);
const admin = await Admin.findOne({ email: 'admin@example.com' });
const isMatch = await bcrypt.compare('admin123', admin.password);
if (isMatch) {
  const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  console.log('\n✅ REAL ADMIN TOKEN (copy this):');
  console.log(token);
  console.log('\nAdmin ID:', admin._id);
  console.log('Email:', admin.email);
  console.log('Role:', admin.role);
} else {
  console.log('Password mismatch');
}
process.exit();
