const mongoose = require('mongoose');

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
      name: { type: String, required: true }, // e.g. "8GB RAM, 128GB Storage"
      price: { type: Number, required: true },
      stock: { type: Number, default: 0 },
      sku: { type: String }
    }
  ],
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0,
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
    required: false, // Changed to false for now to facilitate admin testing
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
