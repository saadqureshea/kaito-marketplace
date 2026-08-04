import mongoose from "mongoose";

// Remote Work: a Worker's application to a Job, plus the message thread
// between employer and worker for that application.
const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 4000 },
    sentAt: { type: Date, default: Date.now },
    readByRecipient: { type: Boolean, default: false },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    coverLetter: { type: String, required: true, maxlength: 3000 },
    cvUrl: { type: String, required: true },
    portfolioUrl: { type: String, default: "" },
    proposedRate: { type: Number },

    status: {
      type: String,
      enum: ["submitted", "shortlisted", "interviewing", "hired", "rejected", "withdrawn"],
      default: "submitted",
    },

    messages: [messageSchema],
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, worker: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
