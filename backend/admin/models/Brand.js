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
  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Brand || mongoose.model('Brand', brandSchema);
