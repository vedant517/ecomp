const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const Category = require("./models/Category");
const Product = require("./models/Product");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create sample categories
    const categories = await Category.create([
      {
        name: "Electronics",
        slug: "electronics",
        description: "Electronic devices and gadgets",
        image: "https://via.placeholder.com/300?text=Electronics",
        subcategories: [
          { name: "Mobiles", slug: "mobiles", description: "Mobile phones" },
          { name: "Laptops", slug: "laptops", description: "Laptop computers" },
          { name: "Accessories", slug: "accessories", description: "Tech accessories" },
        ],
      },
      {
        name: "Fashion",
        slug: "fashion",
        description: "Clothing and fashion items",
        image: "https://via.placeholder.com/300?text=Fashion",
        subcategories: [
          { name: "Men", slug: "men", description: "Men's clothing" },
          { name: "Women", slug: "women", description: "Women's clothing" },
          { name: "Kids", slug: "kids", description: "Kids' clothing" },
        ],
      },
      {
        name: "Home & Kitchen",
        slug: "home-kitchen",
        description: "Home and kitchen products",
        image: "https://via.placeholder.com/300?text=Home+Kitchen",
        subcategories: [
          { name: "Furniture", slug: "furniture", description: "Home furniture" },
          { name: "Kitchenware", slug: "kitchenware", description: "Kitchen items" },
          { name: "Decor", slug: "decor", description: "Home decoration" },
        ],
      },
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create sample products
    const products = await Product.create([
      // Electronics - Mobiles
      {
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        description: "Latest Apple smartphone with advanced features",
        price: 99999,
        original_price: 129999,
        discounted_price: 99999,
        category: "Electronics",
        subcategory: "Mobiles",
        image: "https://via.placeholder.com/300?text=iPhone+15",
        images: ["https://via.placeholder.com/300?text=iPhone+15"],
        rating: 4.5,
        stock: 50,
        sold: 150,
        brand: "Apple",
        tags: ["phone", "smartphone", "iphone"],
      },
      {
        name: "Samsung Galaxy S24",
        slug: "samsung-galaxy-s24",
        description: "Premium Android smartphone",
        price: 79999,
        original_price: 89999,
        discounted_price: 79999,
        category: "Electronics",
        subcategory: "Mobiles",
        image: "https://via.placeholder.com/300?text=Galaxy+S24",
        images: ["https://via.placeholder.com/300?text=Galaxy+S24"],
        rating: 4.3,
        stock: 30,
        sold: 100,
        brand: "Samsung",
        tags: ["phone", "smartphone", "android"],
      },
      {
        name: "OnePlus 12",
        slug: "oneplus-12",
        description: "Fast and smooth Android experience",
        price: 44999,
        original_price: 54999,
        discounted_price: 44999,
        category: "Electronics",
        subcategory: "Mobiles",
        image: "https://via.placeholder.com/300?text=OnePlus+12",
        images: ["https://via.placeholder.com/300?text=OnePlus+12"],
        rating: 4.2,
        stock: 25,
        sold: 80,
        brand: "OnePlus",
        tags: ["phone", "smartphone", "android"],
      },

      // Electronics - Laptops
      {
        name: "MacBook Pro 16",
        slug: "macbook-pro-16",
        description: "Powerful laptop for professionals",
        price: 249999,
        original_price: 279999,
        discounted_price: 249999,
        category: "Electronics",
        subcategory: "Laptops",
        image: "https://via.placeholder.com/300?text=MacBook+Pro",
        images: ["https://via.placeholder.com/300?text=MacBook+Pro"],
        rating: 4.7,
        stock: 15,
        sold: 45,
        brand: "Apple",
        tags: ["laptop", "computer", "macbook"],
      },
      {
        name: "Dell XPS 13",
        slug: "dell-xps-13",
        description: "Compact and powerful Windows laptop",
        price: 119999,
        original_price: 139999,
        discounted_price: 119999,
        category: "Electronics",
        subcategory: "Laptops",
        image: "https://via.placeholder.com/300?text=Dell+XPS",
        images: ["https://via.placeholder.com/300?text=Dell+XPS"],
        rating: 4.4,
        stock: 20,
        sold: 60,
        brand: "Dell",
        tags: ["laptop", "computer", "windows"],
      },

      // Fashion - Men
      {
        name: "Men's T-Shirt",
        slug: "mens-tshirt",
        description: "Comfortable cotton t-shirt",
        price: 499,
        original_price: 699,
        discounted_price: 499,
        category: "Fashion",
        subcategory: "Men",
        image: "https://via.placeholder.com/300?text=T-Shirt",
        images: ["https://via.placeholder.com/300?text=T-Shirt"],
        rating: 4.0,
        stock: 200,
        sold: 500,
        brand: "Generic",
        tags: ["clothing", "men", "tshirt"],
      },
      {
        name: "Men's Jeans",
        slug: "mens-jeans",
        description: "Classic blue denim jeans",
        price: 1299,
        original_price: 1799,
        discounted_price: 1299,
        category: "Fashion",
        subcategory: "Men",
        image: "https://via.placeholder.com/300?text=Jeans",
        images: ["https://via.placeholder.com/300?text=Jeans"],
        rating: 4.2,
        stock: 150,
        sold: 400,
        brand: "Generic",
        tags: ["clothing", "men", "jeans"],
      },

      // Fashion - Women
      {
        name: "Women's Dress",
        slug: "womens-dress",
        description: "Elegant summer dress",
        price: 1599,
        original_price: 2299,
        discounted_price: 1599,
        category: "Fashion",
        subcategory: "Women",
        image: "https://via.placeholder.com/300?text=Dress",
        images: ["https://via.placeholder.com/300?text=Dress"],
        rating: 4.3,
        stock: 100,
        sold: 300,
        brand: "Generic",
        tags: ["clothing", "women", "dress"],
      },
      {
        name: "Women's Handbag",
        slug: "womens-handbag",
        description: "Stylish leather handbag",
        price: 2999,
        original_price: 4499,
        discounted_price: 2999,
        category: "Fashion",
        subcategory: "Women",
        image: "https://via.placeholder.com/300?text=Handbag",
        images: ["https://via.placeholder.com/300?text=Handbag"],
        rating: 4.4,
        stock: 80,
        sold: 250,
        brand: "Generic",
        tags: ["accessories", "women", "handbag"],
      },

      // Home & Kitchen
      {
        name: "Dining Table Set",
        slug: "dining-table-set",
        description: "4-seater dining table with chairs",
        price: 15999,
        original_price: 24999,
        discounted_price: 15999,
        category: "Home & Kitchen",
        subcategory: "Furniture",
        image: "https://via.placeholder.com/300?text=Dining+Table",
        images: ["https://via.placeholder.com/300?text=Dining+Table"],
        rating: 4.5,
        stock: 20,
        sold: 60,
        brand: "Generic",
        tags: ["furniture", "dining", "table"],
      },
      {
        name: "Electric Kettle",
        slug: "electric-kettle",
        description: "Fast boiling electric kettle",
        price: 799,
        original_price: 1299,
        discounted_price: 799,
        category: "Home & Kitchen",
        subcategory: "Kitchenware",
        image: "https://via.placeholder.com/300?text=Kettle",
        images: ["https://via.placeholder.com/300?text=Kettle"],
        rating: 4.1,
        stock: 150,
        sold: 400,
        brand: "Generic",
        tags: ["kitchen", "appliance", "kettle"],
      },
    ]);

    console.log(`✅ Created ${products.length} products`);
    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

seedDatabase();
