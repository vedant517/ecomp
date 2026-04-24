const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../server/.env" });

const userSchema = new mongoose.Schema({
  email: String,
  mobile: String,
});

const User = mongoose.model("User", userSchema);

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    const users = await User.find({}).limit(5);
    if (users.length === 0) {
      console.log("No users found.");
    } else {
      console.log("Found users:");
      users.forEach(u => console.log(`Email: ${u.email}, Mobile: ${u.mobile}`));
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkUsers();
