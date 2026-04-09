import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a subcategory name'],
    trim: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
export default Subcategory;
