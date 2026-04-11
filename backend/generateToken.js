import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET || 'ecommerce_secret_key_2024_auth_secure_999';

const payload = {
  id: '6613c7a2b0e8c5a2c8f8e001', // Example Mongo ID
  role: 'admin'
};

const token = jwt.sign(payload, secret, { expiresIn: '7d' });

console.log('--- GENERATED TEST TOKEN ---');
console.log(token);
console.log('--- END ---');
