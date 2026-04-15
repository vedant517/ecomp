import mongoose from "mongoose";

const adminProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      unique: true,
    },

    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },

    email: { type: String, required: true, unique: true },

    phoneNumber: { type: String, default: "" },

    // Date of Birth
    dateOfBirth: { type: Date, default: null },

    // Country Code (cc)
    countryCode: { type: String, default: "" },

    // Address object
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },

    profileImageUrl: { type: String, default: "" },

    biography: { type: String, default: "" },

    // Social Media Links
    socialMedia: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    // Credit Card (SAFE - no sensitive storage)
    creditCard: {
      cardHolderName: { type: String, default: "" },

      last4: { type: String, default: "" }, // only last 4 digits
      brand: { type: String, default: "" }, // Visa, MasterCard, etc.

      expiryMonth: { type: String, default: "" },
      expiryYear: { type: String, default: "" },

      paymentToken: { type: String, default: "" }, // from Razorpay/Stripe
    },

    role: {
      type: String,
      enum: ["superadmin", "manager", "editor"],
      default: "manager",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

const AdminProfile = mongoose.model("AdminProfile", adminProfileSchema);
export default AdminProfile;