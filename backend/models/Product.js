import mongoose from "mongoose";

// Covers both "Digital Products" (instant download) and
// "Made-to-Order Products" (custom/handmade, manufacturer tracking)
const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 5000 },

    listingType: {
      type: String,
      enum: ["digital", "made_to_order"],
      required: true,
    },

    category: { type: String, required: true }, // e.g. "Templates", "Graphics", "Code", "E-books", "Clothing", "Handmade"
    tags: [{ type: String }],

    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },

    images: [{ type: String }],

    // Digital-only
    fileUrl: { type: String }, // secure download link, only revealed post-purchase
    fileSizeMb: { type: Number },

    // Made-to-order-only
    productionDetails: {
      leadTimeDays: { type: Number },
      manufacturer: { type: String },
      trackingProvider: { type: String },
      customizationOptions: [{ type: String }], // e.g. sizes, colors, engraving text
    },

    stock: { type: Number, default: -1 }, // -1 = unlimited (digital)

    status: {
      type: String,
      enum: ["pending_review", "approved", "rejected", "archived"],
      default: "pending_review",
    },
    rejectionReason: { type: String, default: "" },

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.model("Product", productSchema);
