import express from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import Job from "../models/Job.js";
import Order from "../models/Order.js";
import { protect, requireRole } from "../middleware/auth.js";

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

// ---- User management ----
router.get("/users", asyncHandler(async (req, res) => {
  res.json(await User.find().select("-password").sort("-createdAt"));
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
