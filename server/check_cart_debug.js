const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const Cart = require("./models/Cart");

async function checkCart() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const carts = await Cart.find({});
  console.log(`Total Cart Documents: ${carts.length}`);
  
  const userCarts = {};
  carts.forEach(c => {
    if (!userCarts[c.userId]) userCarts[c.userId] = [];
    userCarts[c.userId].push(c);
  });

  for (const userId in userCarts) {
    console.log(`\nUser: ${userId}`);
    const items = userCarts[userId];
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    console.log(`  Items (Documents): ${items.length}`);
    console.log(`  Total Quantity: ${totalQty}`);
    items.forEach(i => {
      console.log(`    - ${i.name} (ID: ${i.productId}) | Qty: ${i.quantity}`);
    });
  }

  await mongoose.disconnect();
}

checkCart();
