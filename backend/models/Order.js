import mongoose from "mongoose";

// Unified order/checkout record for Products AND Services.
// Commission math is stored on the order itself so financial history
// stays accurate even if platform fee percentages change later.
const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    itemType: { type: String, enum: ["product", "service"], required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    servicePackage: { type: String, enum: ["basic", "standard", "premium"] },

    quantity: { type: Number, default: 1, min: 1 },

    // --- Commission breakdown (see utils/commission.js) ---
    itemPrice: { type: Number, required: true }, // unit price at time of purchase
    subtotal: { type: Number, required: true }, // itemPrice * quantity
    marketplaceFee: { type: Number, required: true }, // 15% of subtotal
    paymentProcessingFee: { type: Number, required: true }, // 5% of subtotal
    totalCommission: { type: Number, required: true }, // 20% of subtotal
    sellerPayout: { type: Number, required: true }, // 80% of subtotal
    totalCharged: { type: Number, required: true }, // what the buyer actually paid (== subtotal)

    // Custom order details for made-to-order items
    customizationNotes: { type: String, default: "" },
    shippingAddress: {
      line1: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    trackingNumber: { type: String, default: "" },

    // --- PayPal (unused while running on Stripe test mode, kept for when
    // PayPal Sandbox credentials become available) ---
    paypalOrderId: { type: String },
    paypalCaptureId: { type: String },

    // --- Stripe ---
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "awaiting_payment",
        "in_production", // made-to-order
        "in_progress", // services
        "delivered",
        "completed",
        "cancelled",
        "disputed",
      ],
      default: "awaiting_payment",
    },

    // --- Escrow ---
    // Funds are captured at checkout but the seller's 80% is only released
    // once the buyer confirms receipt (or the hold period lapses), so a buyer
    // always has recourse while the money is still held.
    escrowStatus: {
      type: String,
      enum: ["none", "held", "released", "refunded"],
      default: "none",
    },
    buyerConfirmedAt: { type: Date },
    deliveredAt: { type: Date },

    payoutReleased: { type: Boolean, default: false },
    payoutBatchId: { type: String, default: "" },
    payoutError: { type: String, default: "" },

    // --- Dispute ---
    disputeReason: { type: String, maxlength: 2000, default: "" },
    disputeRaisedAt: { type: Date },
    disputeResolution: {
      type: String,
      enum: ["", "refunded", "released", "cancelled"],
      default: "",
    },
    disputeResolutionNote: { type: String, maxlength: 2000, default: "" },
    disputeResolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
