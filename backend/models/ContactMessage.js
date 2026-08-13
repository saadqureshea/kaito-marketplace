import mongoose from "mongoose";

// Submissions from the public Contact Us page. No email delivery is wired up
// yet - these are stored for an admin to review, same as an inbox.
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
  },
  { timestamps: true }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
