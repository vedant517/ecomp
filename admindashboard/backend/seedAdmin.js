const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('./models/Admin');

dotenv.config({ path: path.resolve(__dirname, './.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const email = 'admin@example.com';
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({
      name: 'Admin User',
      email: email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin created: admin@example.com / admin123');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
