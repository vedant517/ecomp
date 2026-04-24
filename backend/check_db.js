import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Admin from "./admin/models/Admin.js";

const run = async () => {
    console.log("Connecting to:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    console.log("Connected. readyState:", mongoose.connection.readyState);
    const admin = await Admin.findOne().lean();
    console.log("Found admin:", admin);
    process.exit(0);
};

run().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
