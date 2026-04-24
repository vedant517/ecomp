const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const Category = require("./models/Category");
const Product = require("./models/Product");

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const categories = await Category.find({});
    console.log(`\n--- Categories (${categories.length}) ---`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (Slug: ${cat.slug}, ID: ${cat._id})`);
      console.log(`  Subcategories: ${cat.subcategories.length > 0 ? cat.subcategories.map(s => `${s.name} (${s._id})`).join(", ") : "NONE"}`);
    });

    const products = await Product.find({}).limit(5);
    console.log(`\n--- Sample Products (${products.length}) ---`);
    products.forEach(p => {
      console.log(`- ${p.name}`);
      console.log(`  Category: ${p.category}`);
      console.log(`  Subcategory: ${p.subcategory}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkData();
