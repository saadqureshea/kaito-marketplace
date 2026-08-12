import express from "express";
import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";
import { calculateCommission } from "../utils/commission.js";

const router = express.Router();

const MAX_LINES = 20;

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error("Stripe is not configured - set STRIPE_SECRET_KEY in backend/.env");
    err.statusCode = 500;
    throw err;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * Resolves one cart line against the database. Price, seller and availability
 * always come from the stored listing - the client only ever names what it
 * wants, never what it costs.
 */
async function resolveLine({ itemType, itemId, servicePackage, quantity = 1 }) {
  const qty = Math.max(1, Math.min(99, Number(quantity) || 1));

  if (itemType === "product") {
    const product = await Product.findById(itemId);
    if (!product || product.status !== "approved") {
      const err = new Error("A product in your cart is no longer available");
      err.statusCode = 404;
      throw err;
    }
    return {
      itemType,
      quantity: qty,
      unitPrice: product.price,
      sellerId: product.seller,
      productRef: product._id,
      serviceRef: null,
      servicePackage: undefined,
      title: product.title,
      image: product.images?.[0],
    };
  }

  if (itemType === "service") {
    const service = await Service.findById(itemId);
    if (!service || service.status !== "approved") {
      const err = new Error("A service in your cart is no longer available");
      err.statusCode = 404;
      throw err;
    }
    const pkg = service.packages.find((p) => p.name === servicePackage);
    if (!pkg) {
      const err = new Error("Invalid service package selected");
      err.statusCode = 400;
      throw err;
    }
    return {
      itemType,
      quantity: qty,
      unitPrice: pkg.price,
      sellerId: service.seller,
      productRef: null,
      serviceRef: service._id,
      servicePackage,
      title: `${service.title} (${pkg.name})`,
      image: service.images?.[0],
    };
  }

  const err = new Error("itemType must be 'product' or 'service'");
  err.statusCode = 400;
  throw err;
}

/**
 * @route POST /api/payments/create-checkout-session
 * Body: { items: [{ itemType, itemId, servicePackage?, quantity? }], ... }
 *       (a single { itemType, itemId, ... } is still accepted for Buy now)
 *
 * Creates one Stripe Checkout Session covering every line, and one Order per
 * line. Orders stay per-line rather than becoming a basket document so the
 * existing per-seller payout, sales dashboard and one-review-per-order rules
 * keep working unchanged - a basket spanning two sellers settles as two
 * orders, which is what the payout logic expects.
 */
router.post(
  "/create-checkout-session",
  protect,
  asyncHandler(async (req, res) => {
    const { items, customizationNotes, shippingAddress } = req.body;

    // Accept the legacy single-item shape so existing "Buy now" links work.
    const rawLines = Array.isArray(items) && items.length ? items : [req.body];

    if (rawLines.length > MAX_LINES) {
      res.status(400);
      throw new Error(`A single checkout can hold at most ${MAX_LINES} items`);
    }

    // Resolve everything before touching Stripe or writing any Order, so an
    // invalid line fails cleanly instead of leaving half a checkout behind.
    const lines = [];
    for (const raw of rawLines) {
      const resolved = await resolveLine(raw);
      lines.push({ ...resolved, commission: calculateCommission(resolved.unitPrice, resolved.quantity) });
    }

    const hasPhysical = lines.some((l) => l.itemType === "product");

    const session = await stripeClient().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lines.map((l) => ({
        price_data: {
          currency: "usd",
          product_data: { name: l.title },
          unit_amount: Math.round(l.commission.itemPrice * 100),
        },
        quantity: l.quantity,
      })),
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: { buyer: String(req.user._id), lineCount: String(lines.length) },
    });

    // Orders are linked to the session rather than listed in Stripe metadata,
    // which has a per-value size limit a large basket would blow through.
    const orders = await Order.insertMany(
      lines.map((l) => ({
        buyer: req.user._id,
        seller: l.sellerId,
        itemType: l.itemType,
        product: l.productRef,
        service: l.serviceRef,
        servicePackage: l.servicePackage,
        quantity: l.quantity,
        itemPrice: l.commission.itemPrice,
        subtotal: l.commission.subtotal,
        marketplaceFee: l.commission.marketplaceFee,
        paymentProcessingFee: l.commission.paymentProcessingFee,
        totalCommission: l.commission.totalCommission,
        sellerPayout: l.commission.sellerPayout,
        totalCharged: l.commission.totalCharged,
        customizationNotes: hasPhysical ? customizationNotes : "",
        shippingAddress: hasPhysical ? shippingAddress : undefined,
        stripeSessionId: session.id,
        paymentStatus: "pending",
        orderStatus: "awaiting_payment",
      }))
    );

    const totals = lines.reduce(
      (acc, l) => {
        acc.subtotal += l.commission.subtotal;
        acc.marketplaceFee += l.commission.marketplaceFee;
        acc.paymentProcessingFee += l.commission.paymentProcessingFee;
        acc.totalCommission += l.commission.totalCommission;
        acc.sellerPayout += l.commission.sellerPayout;
        acc.totalCharged += l.commission.totalCharged;
        return acc;
      },
      { subtotal: 0, marketplaceFee: 0, paymentProcessingFee: 0, totalCommission: 0, sellerPayout: 0, totalCharged: 0 }
    );
    Object.keys(totals).forEach((k) => (totals[k] = Math.round(totals[k] * 100) / 100));

    res.status(201).json({
      url: session.url,
      sessionId: session.id,
      orderIds: orders.map((o) => o._id),
      commission: totals,
    });
  })
);

/**
 * @route POST /api/payments/confirm-session
 * Body: { sessionId }
 * Verifies payment status with Stripe rather than trusting the redirect, then
 * flips every order belonging to that session.
 */
router.post(
  "/confirm-session",
  protect,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body;

    const orders = await Order.find({ stripeSessionId: sessionId });
    if (orders.length === 0) {
      res.status(404);
      throw new Error("No orders found for this checkout session");
    }
    if (orders.some((o) => String(o.buyer) !== String(req.user._id))) {
      res.status(403);
      throw new Error("Not authorized to confirm this checkout");
    }

    if (orders.every((o) => o.paymentStatus === "paid")) {
      return res.json({ status: "already_paid", orders });
    }

    const session = await stripeClient().checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    await Promise.all(
      orders.map((order) => {
        if (paid) {
          order.paymentStatus = "paid";
          order.stripePaymentIntentId = session.payment_intent;
          order.orderStatus = order.itemType === "product" ? "in_production" : "in_progress";
          // Money is captured but the seller's share is withheld until the
          // buyer confirms receipt - see releaseEscrow in orderRoutes.
          order.escrowStatus = "held";
        } else {
          order.paymentStatus = "failed";
        }
        return order.save();
      })
    );

    res.json({ status: session.payment_status, orders });
  })
);

export default router;
