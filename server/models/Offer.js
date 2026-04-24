const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    discountPercent: { type: Number, required: true },
    tag: { type: String },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Offer || mongoose.model("Offer", offerSchema);
