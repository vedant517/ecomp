import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a brand name'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  logo: {
    type: String,
    default: 'default-brand.jpg',
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
