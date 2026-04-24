const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const Category = require("./models/Category");
const Product = require("./models/Product");

const repairData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Define the expected subcategories for each category
    const categoryData = {
      "Electronics": [
        { name: "Mobiles", slug: "mobiles", description: "Mobile phones" },
        { name: "Laptops", slug: "laptops", description: "Laptop computers" },
        { name: "Accessories", slug: "accessories", description: "Tech accessories" },
      ],
      "Fashion": [
        { name: "Men", slug: "men", description: "Men's clothing" },
        { name: "Women", slug: "women", description: "Women's clothing" },
        { name: "Kids", slug: "kids", description: "Kids' clothing" },
      ],
      "Home and Kitchen": [
        { name: "Furniture", slug: "furniture", description: "Home furniture" },
        { name: "Kitchenware", slug: "kitchenware", description: "Kitchen items" },
        { name: "Decor", slug: "decor", description: "Home decoration" },
      ],
    };

    for (const [catName, subcats] of Object.entries(categoryData)) {
      const cat = await Category.findOne({ name: catName });
      if (cat) {
        console.log(`Updating category: ${catName}`);
        cat.subcategories = subcats;
        await cat.save();
        console.log(`  Added ${subcats.length} subcategories`);
      } else {
        console.log(`Category not found: ${catName}`);
      }
    }

    // Now fix the products. 
    // The current products have IDs for category/subcategory.
    // Let's change them to the string names so they are easier to filter by,
    // OR keep them as IDs but ensure the IDs match.
    
    // Actually, let's see if we can find the subcategory by name in the updated categories.
    const allProducts = await Product.find({});
    for (const p of allProducts) {
      // Find the category by ID
      const cat = await Category.findById(p.category);
      if (cat) {
        // Update product category to the NAME (string) to match seed logic
        p.category = cat.name;
        
        // Try to find if the current subcategory ID matches any subcategory in the category
        // But since we just re-inserted them, their IDs might have changed.
        // So let's look at the product name to guess the subcategory or just use a default.
        if (p.name.toLowerCase().includes("samsung") || p.name.toLowerCase().includes("iphone")) {
            p.subcategory = "Mobiles";
        } else if (p.name.toLowerCase().includes("laptop") || p.name.toLowerCase().includes("macbook")) {
            p.subcategory = "Laptops";
        } else if (p.name.toLowerCase().includes("shirt") || p.name.toLowerCase().includes("jeans")) {
            p.subcategory = "Men";
        } else if (p.name.toLowerCase().includes("dress")) {
            p.subcategory = "Women";
        }
        
        await p.save();
        console.log(`Updated product: ${p.name} -> Cat: ${p.category}, Subcat: ${p.subcategory}`);
      }
    }

    console.log("🎉 Database repaired successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

repairData();
