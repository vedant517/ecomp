// models/order.model.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  product: {
    name: String,
    image: String,
  },
  price: Number,

  payment: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid",
  },

  status: {
    type: String,
    enum: ["Pending", "Delivered", "Cancelled", "Shipped"],
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);