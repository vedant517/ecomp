const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const fixIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    const db = mongoose.connection.db;
    const collection = db.collection('wishlists');
    
    // Check indexes
    const indexes = await collection.indexes();
    console.log("Indexes:", indexes.map(i => i.name));
    
    if (indexes.some(i => i.name === 'user_1_product_1')) {
        await collection.dropIndex('user_1_product_1');
        console.log("✅ Dropped index user_1_product_1");
    } else {
        console.log("Index user_1_product_1 not found");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixIndex();
