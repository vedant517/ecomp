const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const Category = require("./models/Category");

const checkData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const categories = await Category.find({}).lean();
  const sample = categories.map(c => ({
    _id: c._id,
    name: c.name,
    subcategories: (c.subcategories || []).map(s => ({ _id: s._id, name: s.name }))
  }));
  console.log(JSON.stringify(sample, null, 2));
  process.exit(0);
}

checkData();
