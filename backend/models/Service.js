import mongoose from "mongoose";

// "Digital Services" - web/app dev, UI/UX, video editing, writing, AI automation
const packageTierSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ["basic", "standard", "premium"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 5 },
    deliveryDays: { type: Number, required: true },
    revisions: { type: Number, default: 1 },
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 5000 },

    category: {
      type: String,
      enum: ["web_app_dev", "ui_ux_design", "video_editing", "writing", "ai_automation", "other"],
      required: true,
    },
    tags: [{ type: String }],
    images: [{ type: String }],

    packages: {
      type: [packageTierSchema],
      validate: (v) => v.length > 0,
    },

    status: {
      type: String,
      enum: ["pending_review", "approved", "rejected", "archived"],
      default: "pending_review",
    },
    rejectionReason: { type: String, default: "" },

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.model("Service", serviceSchema);
