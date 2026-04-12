import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import User from './models/User.js';

dotenv.config();

// Paste your token here to debug
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDc5NjA3YjkwZjMzN2E5MDU3NGY1MiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NTk5NTY2MywiZXhwIjoxNzc2NjAwNDYzfQ.WVyoqitilRYycQMoXKsgRirqGUwQnKvnNDt_jiNYiAw';

await mongoose.connect(process.env.MONGODB_URI);

try {
  const decoded = jwt.verify(TOKEN, process.env.JWT_SECRET);
  console.log('✅ Token decoded:', decoded);

  let user = await User.findById(decoded.id);
  console.log('User model lookup:', user ? user.email : 'NOT FOUND');

  let admin = await Admin.findById(decoded.id);
  console.log('Admin model lookup:', admin ? admin.email + ' role=' + admin.role : 'NOT FOUND');

  const finalUser = user || admin;
  if (finalUser) {
    console.log('\n✅ Auth would SUCCEED. req.user.role =', finalUser.role);
  } else {
    console.log('\n❌ Auth would FAIL - user not found in either model');
  }
} catch(e) {
  console.log('❌ Token verify failed:', e.message);
}

process.exit();
