import express from "express";
import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { protect, requireRole } from "../middleware/auth.js";
import { sendPayout } from "../utils/paypalPayout.js";

const router = express.Router();

// @route GET /api/orders/mine  (Buyer - purchase history)
router.get(
  "/mine",
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("product", "title images listingType")
      .populate("service", "title images")
      .populate("seller", "name sellerProfile.storeName")
      .sort("-createdAt");
    res.json(orders);
  })
);

// @route GET /api/orders/sales  (Seller - their sales, with payout breakdown)
router.get(
  "/sales",
  protect,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ seller: req.user._id })
      .populate("product", "title images")
      .populate("service", "title images")
      .populate("buyer", "name")
      .sort("-createdAt");

    const totals = orders.reduce(
      (acc, o) => {
        if (o.paymentStatus === "paid") {
          acc.grossRevenue += o.subtotal;
          acc.totalCommissionPaid += o.totalCommission;
          acc.netPayout += o.sellerPayout;
        }
        return acc;
      },
      { grossRevenue: 0, totalCommissionPaid: 0, netPayout: 0 }
    );

    res.json({ orders, totals });
  })
);

// @route GET /api/orders/:id  (Buyer, seller, or admin involved in the order)
// Digital file URL is only ever revealed here, after payment is confirmed.
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("product").populate("service");
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    const isParticipant =
      String(order.buyer) === String(req.user._id) || String(order.seller) === String(req.user._id);
    if (!isParticipant && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }

    const result = order.toObject();
    if (order.itemType === "product" && order.paymentStatus === "paid") {
      const product = await Product.findById(order.product);
      result.downloadUrl = product?.fileUrl || null;
    }
    res.json(result);
  })
);

// @route PUT /api/orders/:id/status  (Seller updates fulfillment: shipped, delivered, etc.)
router.put(
  "/:id/status",
  protect,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (String(order.seller) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized");
    }
    const { orderStatus, trackingNumber } = req.body;
    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // Releasing "completed" triggers the seller's 80% payout via PayPal
    // Payouts (Sandbox). A failure here (e.g. no payout email on file yet)
    // is recorded on the order but never blocks the status change itself -
    // an admin/seller can retry once the seller's PayPal email is set.
    if (orderStatus === "completed" && order.paymentStatus === "paid" && !order.payoutReleased) {
      try {
        const seller = await User.findById(order.seller);
        const { payoutBatchId } = await sendPayout({
          email: seller?.sellerProfile?.payoutEmail,
          amount: order.sellerPayout,
          senderItemId: String(order._id),
          note: `Payout for order ${order._id}`,
        });
        order.payoutReleased = true;
        order.payoutBatchId = payoutBatchId || "";
        order.payoutError = "";
      } catch (payoutErr) {
        order.payoutError = payoutErr.message;
      }
    }

    const updated = await order.save();
    res.json(updated);
  })
);

export default router;
