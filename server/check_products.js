const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const Product = require("./models/Product");

const checkData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({}).lean();
  console.log("Total Products:", products.length);
  const sample = products.slice(0, 3).map(p => ({
    name: p.name,
    category: p.category,
    subcategory: p.subcategory
  }));
  console.log("Sample Products:", JSON.stringify(sample, null, 2));
  process.exit(0);
}

checkData();
