import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contact: {
      emailOrPhone: {
        type: String,
        required: true,
      },
    },
    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      landmark: {
        type: String,
      },
      country: {
        type: String,
        default: "India",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Address || mongoose.model("Address", addressSchema);
