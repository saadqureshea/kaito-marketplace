import mongoose from "mongoose";

// Remote Work: job postings created by Employers
const jobSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 8000 },

    category: { type: String, required: true }, // e.g. "Development", "Design", "Marketing"
    skillsRequired: [{ type: String }],

    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract", "freelance_project"],
      required: true,
    },
    budgetType: { type: String, enum: ["fixed", "hourly"], required: true },
    budgetMin: { type: Number },
    budgetMax: { type: Number },
    currency: { type: String, default: "USD" },

    isRemote: { type: Boolean, default: true },
    location: { type: String, default: "Remote" },

    status: {
      type: String,
      enum: ["pending_review", "open", "closed", "rejected", "archived"],
      default: "pending_review",
    },
    rejectionReason: { type: String, default: "" },

    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", skillsRequired: "text" });

export default mongoose.model("Job", jobSchema);
