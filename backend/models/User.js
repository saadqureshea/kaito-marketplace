import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    line1: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },

    // A user can hold multiple roles over time (e.g. buyer + seller),
    // but "role" is the primary/active dashboard context.
    role: {
      type: String,
      enum: ["buyer", "seller", "worker", "employer", "admin"],
      default: "buyer",
    },
    secondaryRoles: [{ type: String, enum: ["buyer", "seller", "worker", "employer"] }],

    avatarUrl: { type: String, default: "" },
    bio: { type: String, maxlength: 1000, default: "" },
    country: { type: String, default: "" },
    address: addressSchema,

    // Remote Work: professional profile (free) for Workers
    professionalProfile: {
      headline: { type: String, default: "" },
      skills: [{ type: String }],
      hourlyRate: { type: Number, default: 0 },
      cvUrl: { type: String, default: "" },
      portfolioUrl: { type: String, default: "" },
      yearsExperience: { type: Number, default: 0 },
      approvalStatus: {
        type: String,
        enum: ["not_submitted", "pending", "approved", "rejected"],
        default: "not_submitted",
      },
      rejectionReason: { type: String, default: "" },
    },

    // Seller/store info (for Digital Products, Made-to-Order, Services)
    sellerProfile: {
      storeName: { type: String, default: "" },
      storeDescription: { type: String, default: "" },
      payoutEmail: { type: String, default: "" }, // PayPal email for payouts
      isVerifiedSeller: { type: Boolean, default: false },
      rating: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
    },

    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
