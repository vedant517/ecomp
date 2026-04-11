const mongoose = require('mongoose');

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
  description: {
    type: String,
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
module.exports = Subcategory;
