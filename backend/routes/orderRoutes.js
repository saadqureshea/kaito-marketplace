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

/**
 * Attempts the seller payout and records the outcome on the order. A failure
 * (e.g. no payout email on file yet) is stored rather than thrown, so it can
 * never block the status change that triggered it.
 */
export async function releaseEscrow(order) {
  if (order.paymentStatus !== "paid" || order.payoutReleased) return order;
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
  order.escrowStatus = "released";
  return order;
}

// @route PUT /api/orders/:id/status  (Seller updates fulfilment: in production, delivered...)
// A seller can move an order as far as "delivered" but not to "completed" -
// releasing the money is the buyer's call, which is the point of holding it.
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

    if (orderStatus === "completed" && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Only the buyer can complete an order and release the payment");
    }
    if (order.orderStatus === "disputed" && req.user.role !== "admin") {
      res.status(409);
      throw new Error("This order is under dispute and can only be changed by an admin");
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === "delivered") order.deliveredAt = new Date();
    }
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // Admins can still force a release, e.g. when settling a dispute.
    if (orderStatus === "completed") await releaseEscrow(order);

    const updated = await order.save();
    res.json(updated);
  })
);

// @route PUT /api/orders/:id/confirm  (Buyer confirms receipt -> releases escrow)
router.put(
  "/:id/confirm",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (String(order.buyer) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Only the buyer can confirm this order");
    }
    if (order.paymentStatus !== "paid") {
      res.status(400);
      throw new Error("This order has not been paid for");
    }
    if (order.orderStatus === "disputed") {
      res.status(409);
      throw new Error("Resolve the open dispute before confirming this order");
    }
    if (order.orderStatus === "completed") {
      return res.json(order);
    }

    order.orderStatus = "completed";
    order.buyerConfirmedAt = new Date();
    await releaseEscrow(order);

    const updated = await order.save();
    res.json(updated);
  })
);

// @route PUT /api/orders/:id/dispute  (Buyer raises a dispute while funds are held)
router.put(
  "/:id/dispute",
  protect,
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 10) {
      res.status(400);
      throw new Error("Please describe the problem in at least 10 characters");
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (String(order.buyer) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Only the buyer can raise a dispute on this order");
    }
    if (order.paymentStatus !== "paid") {
      res.status(400);
      throw new Error("Only paid orders can be disputed");
    }
    // Once the payout has gone out there is nothing left to hold back, so
    // disputes have to be raised while the money is still in escrow.
    if (order.payoutReleased) {
      res.status(409);
      throw new Error("This payment has already been released to the seller");
    }

    order.orderStatus = "disputed";
    order.disputeReason = reason.trim();
    order.disputeRaisedAt = new Date();
    order.disputeResolution = "";

    const updated = await order.save();
    res.json(updated);
  })
);

export default router;
