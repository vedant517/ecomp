import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  contact: {
    emailOrPhone: { type: String, required: true }
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true }
  }
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);

export default Address;