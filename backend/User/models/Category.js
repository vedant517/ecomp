import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, lowercase: true, unique: true },
  description: { type: String },
  image: { type: String },
});

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, lowercase: true, unique: true },
    description: { type: String },
    image: { type: String },
    subcategories: [subcategorySchema],
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
