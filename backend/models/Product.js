import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      public_id: {
        type: String,
        required: true
      }
    }
  ],
  image: { // Keep for backward compatibility if needed
    type: String,
    default: 'no-photo.jpg',
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Please add a category'],
  },
  subcategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subcategory',
  },
  brand: {
    type: mongoose.Schema.ObjectId,
    ref: 'Brand',
  },
  variants: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      stock: { type: Number, default: 0 },
      sku: { type: String },
      image: { type: String }
    }
  ],
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  taxIncluded: {
    type: Boolean,
    default: true,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
