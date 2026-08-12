import express from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import Job from "../models/Job.js";
import Order from "../models/Order.js";
import { protect, requireRole } from "../middleware/auth.js";
import { releaseEscrow } from "./orderRoutes.js";

const router = express.Router();
router.use(protect, requireRole("admin"));

// ---- Dashboard summary ----
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const [users, pendingProducts, pendingServices, pendingJobs, pendingProfiles, paidOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: "pending_review" }),
      Service.countDocuments({ status: "pending_review" }),
      Job.countDocuments({ status: "pending_review" }),
      User.countDocuments({ "professionalProfile.approvalStatus": "pending" }),
      Order.find({ paymentStatus: "paid" }),
    ]);
    const openDisputes = await Order.countDocuments({ orderStatus: "disputed" });
    const heldInEscrow = paidOrders
      .filter((o) => !o.payoutReleased && o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.sellerPayout, 0);

    const revenue = paidOrders.reduce(
      (acc, o) => {
        acc.gross += o.subtotal;
        acc.marketplaceFee += o.marketplaceFee;
        acc.paymentProcessingFee += o.paymentProcessingFee;
        acc.sellerPayouts += o.sellerPayout;
        return acc;
      },
      { gross: 0, marketplaceFee: 0, paymentProcessingFee: 0, sellerPayouts: 0 }
    );

    res.json({
      totalUsers: users,
      pendingProducts,
      pendingServices,
      pendingJobs,
      pendingProfiles,
      totalOrders: paidOrders.length,
      openDisputes,
      heldInEscrow: Math.round(heldInEscrow * 100) / 100,
      revenue,
    });
  })
);

// ---- Listing approvals ----
router.get("/products/pending", asyncHandler(async (req, res) => {
  res.json(await Product.find({ status: "pending_review" }).populate("seller", "name email"));
}));

router.put("/products/:id/approve", asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, { status: "approved", rejectionReason: "" }, { new: true });
  res.json(p);
}));

router.put("/products/:id/reject", asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", rejectionReason: req.body.reason || "Did not meet marketplace guidelines" },
    { new: true }
  );
  res.json(p);
}));

router.get("/services/pending", asyncHandler(async (req, res) => {
  res.json(await Service.find({ status: "pending_review" }).populate("seller", "name email"));
}));

router.put("/services/:id/approve", asyncHandler(async (req, res) => {
  const s = await Service.findByIdAndUpdate(req.params.id, { status: "approved", rejectionReason: "" }, { new: true });
  res.json(s);
}));

router.put("/services/:id/reject", asyncHandler(async (req, res) => {
  const s = await Service.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", rejectionReason: req.body.reason || "Did not meet marketplace guidelines" },
    { new: true }
  );
  res.json(s);
}));

router.get("/jobs/pending", asyncHandler(async (req, res) => {
  res.json(await Job.find({ status: "pending_review" }).populate("employer", "name email"));
}));

router.put("/jobs/:id/approve", asyncHandler(async (req, res) => {
  const j = await Job.findByIdAndUpdate(req.params.id, { status: "open", rejectionReason: "" }, { new: true });
  res.json(j);
}));

router.put("/jobs/:id/reject", asyncHandler(async (req, res) => {
  const j = await Job.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", rejectionReason: req.body.reason || "Did not meet marketplace guidelines" },
    { new: true }
  );
  res.json(j);
}));

// ---- Worker professional profile approvals ----
router.get("/profiles/pending", asyncHandler(async (req, res) => {
  res.json(await User.find({ "professionalProfile.approvalStatus": "pending" }).select("name email professionalProfile"));
}));

router.put("/profiles/:userId/approve", asyncHandler(async (req, res) => {
  const u = await User.findByIdAndUpdate(
    req.params.userId,
    { "professionalProfile.approvalStatus": "approved", "professionalProfile.rejectionReason": "" },
    { new: true }
  );
  res.json(u);
}));

router.put("/profiles/:userId/reject", asyncHandler(async (req, res) => {
  const u = await User.findByIdAndUpdate(
    req.params.userId,
    {
      "professionalProfile.approvalStatus": "rejected",
      "professionalProfile.rejectionReason": req.body.reason || "Profile incomplete or does not meet guidelines",
    },
    { new: true }
  );
  res.json(u);
}));

// ---- Disputes ----
router.get("/disputes", asyncHandler(async (req, res) => {
  const disputes = await Order.find({ orderStatus: "disputed" })
    .populate("buyer", "name email")
    .populate("seller", "name email sellerProfile.storeName")
    .populate("product", "title images")
    .populate("service", "title images")
    .sort("-disputeRaisedAt");
  res.json(disputes);
}));

/**
 * Settles a dispute one of three ways:
 *   refunded  - buyer gets their money back, nothing goes to the seller
 *   released  - dispute rejected, seller is paid as normal
 *   cancelled - order voided without a payout
 *
 * The Stripe refund itself isn't automated here; this records the decision
 * and stops the escrow from being released, so the money is still held
 * pending a manual refund in the Stripe dashboard.
 */
router.put("/orders/:id/resolve", asyncHandler(async (req, res) => {
  const { resolution, note } = req.body;
  if (!["refunded", "released", "cancelled"].includes(resolution)) {
    res.status(400);
    throw new Error("resolution must be 'refunded', 'released' or 'cancelled'");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.orderStatus !== "disputed") {
    res.status(409);
    throw new Error("This order is not under dispute");
  }

  order.disputeResolution = resolution;
  order.disputeResolutionNote = note || "";
  order.disputeResolvedAt = new Date();

  if (resolution === "released") {
    order.orderStatus = "completed";
    await releaseEscrow(order);
  } else if (resolution === "refunded") {
    order.orderStatus = "cancelled";
    order.paymentStatus = "refunded";
    order.escrowStatus = "refunded";
  } else {
    order.orderStatus = "cancelled";
    order.escrowStatus = "refunded";
  }

  const updated = await order.save();
  res.json(updated);
}));

// ---- User management ----
router.get("/users", asyncHandler(async (req, res) => {
  res.json(await User.find().select("-password").sort("-createdAt"));
}));

// Verification is what the "Verified" mark on listings reflects, so it stays
// an explicit admin action rather than anything a seller can set themselves.
router.put("/users/:id/verify", asyncHandler(async (req, res) => {
  const verified = req.body.verified !== false;
  const u = await User.findByIdAndUpdate(
    req.params.id,
    { "sellerProfile.isVerifiedSeller": verified },
    { new: true }
  ).select("-password");
  res.json(u);
}));

router.put("/users/:id/deactivate", asyncHandler(async (req, res) => {
  const u = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password");
  res.json(u);
}));

router.put("/users/:id/activate", asyncHandler(async (req, res) => {
  const u = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select("-password");
  res.json(u);
}));

export default router;
