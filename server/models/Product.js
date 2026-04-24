const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, lowercase: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    original_price: { type: Number },
    discounted_price: { type: Number },
    category: { type: String }, // Can be ID or name
    subcategory: { type: String },
    image: { type: String },
    images: [mongoose.Schema.Types.Mixed], // Support strings or Cloudinary objects
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now },
      },
    ],
    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    brand: { type: String },
    tags: [String],
    variants: [
      {
        name: String,
        value: String,
      },
    ],
    sku: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
