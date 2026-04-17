import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  contact: {
    emailOrPhone: { type: String, required: true }
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true }
  }
}, { timestamps: true });

export default mongoose.models.Address || mongoose.model("Address", addressSchema);