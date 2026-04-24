import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './admin/models/Admin.js';

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'admin@gmail.com';
    const newPassword = 'admin123';
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updated = await Admin.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (updated) {
      console.log('Successfully reset password for:', email);
      console.log('New Password is: admin123');
    } else {
      console.log('Admin not found with email:', email);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

resetAdmin();
