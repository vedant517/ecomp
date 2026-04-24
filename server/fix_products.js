const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const Product = require("./models/Product");
const Category = require("./models/Category");

const fixProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const categories = await Category.find({});
    const allProducts = await Product.find({});
    
    let updatedCount = 0;

    for (const p of allProducts) {
      // Find category by ID (if p.category is ID) or name
      let cat = categories.find(c => c._id.toString() === p.category || c.name === p.category);
      
      if (!cat) {
        console.log(`No category found for product ${p.name} (category field: ${p.category})`);
        continue;
      }

      // Ensure product category is set to category ID
      p.category = cat._id.toString();

      // Guess the correct subcategory based on product name
      let subcatName = null;
      let lowerName = p.name.toLowerCase();
      
      if (cat.name === "Electronics") {
          if (lowerName.includes("samsung") || lowerName.includes("iphone") || lowerName.includes("phone")) subcatName = "Mobiles";
          else if (lowerName.includes("laptop") || lowerName.includes("macbook")) subcatName = "Laptops";
          else subcatName = "Accessories";
      } else if (cat.name === "Fashion") {
          if (lowerName.includes("shirt") || lowerName.includes("jeans") || lowerName.includes("men")) subcatName = "Men";
          else if (lowerName.includes("dress") || lowerName.includes("women")) subcatName = "Women";
          else subcatName = "Kids";
      } else if (cat.name === "Home and Kitchen") {
          if (lowerName.includes("chair") || lowerName.includes("table") || lowerName.includes("sofa")) subcatName = "Furniture";
          else if (lowerName.includes("pan") || lowerName.includes("kitchen") || lowerName.includes("cook")) subcatName = "Kitchenware";
          else subcatName = "Decor";
      }
      
      if (subcatName) {
         const subcatObj = cat.subcategories.find(s => s.name === subcatName);
         if (subcatObj) {
            p.subcategory = subcatObj._id.toString();
            updatedCount++;
         } else {
            // fallback: first subcategory
            if (cat.subcategories.length > 0) {
               p.subcategory = cat.subcategories[0]._id.toString();
               updatedCount++;
            }
         }
      } else {
         if (cat.subcategories.length > 0) {
            p.subcategory = cat.subcategories[0]._id.toString();
            updatedCount++;
         }
      }

      await p.save();
    }

    console.log(`🎉 Updated ${updatedCount} products with correct category/subcategory IDs!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixProducts();
