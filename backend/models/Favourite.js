import mongoose from "mongoose";

/**
 * A saved listing, service or professional.
 *
 * Stored server-side rather than in localStorage (as the cart is) because a
 * wishlist is only meaningful once you have an account, and people expect it
 * to follow them between devices.
 */
const favouriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemType: { type: String, enum: ["product", "service", "talent"], required: true },
    // Kept as a bare id with itemType alongside, rather than three nullable
    // refs, so adding a favouritable type later doesn't change the schema.
    item: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

// Saving the same thing twice is a no-op rather than a duplicate row.
favouriteSchema.index({ user: 1, itemType: 1, item: 1 }, { unique: true });

export default mongoose.model("Favourite", favouriteSchema);
