import mongoose from "mongoose";

// A buyer's review of a completed Order, tied to the Product or Service.
// One review per order - enforced by the unique index below.
const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    itemType: { type: String, enum: ["product", "service"], required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },

    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 2000, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
