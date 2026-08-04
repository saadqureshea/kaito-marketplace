import express from "express";
import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";
import { calculateCommission } from "../utils/commission.js";

const router = express.Router();

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error("Stripe is not configured - set STRIPE_SECRET_KEY in backend/.env");
    err.statusCode = 500;
    throw err;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * @route POST /api/payments/create-checkout-session
 * Body: { itemType: "product"|"service", itemId, servicePackage?, quantity?, customizationNotes?, shippingAddress? }
 *
 * Resolves the price server-side (never trust a client-sent price),
 * computes the 15/5/20/80 commission split, stores a "pending" Order, and
 * creates a Stripe Checkout Session (test mode) for the buyer-facing
 * amount. The buyer is redirected to Stripe's hosted checkout page.
 */
router.post(
  "/create-checkout-session",
  protect,
  asyncHandler(async (req, res) => {
    const { itemType, itemId, servicePackage, quantity = 1, customizationNotes, shippingAddress } = req.body;

    let unitPrice, sellerId, productRef = null, serviceRef = null, itemTitle;

    if (itemType === "product") {
      const product = await Product.findById(itemId);
      if (!product || product.status !== "approved") {
        res.status(404);
        throw new Error("Product not available");
      }
      unitPrice = product.price;
      sellerId = product.seller;
      productRef = product._id;
      itemTitle = product.title;
    } else if (itemType === "service") {
      const service = await Service.findById(itemId);
      if (!service || service.status !== "approved") {
        res.status(404);
        throw new Error("Service not available");
      }
      const pkg = service.packages.find((p) => p.name === servicePackage);
      if (!pkg) {
        res.status(400);
        throw new Error("Invalid service package selected");
      }
      unitPrice = pkg.price;
      sellerId = service.seller;
      serviceRef = service._id;
      itemTitle = `${service.title} (${pkg.name})`;
    } else {
      res.status(400);
      throw new Error("itemType must be 'product' or 'service'");
    }

    const commission = calculateCommission(unitPrice, quantity);

    const order = await Order.create({
      buyer: req.user._id,
      seller: sellerId,
      itemType,
      product: productRef,
      service: serviceRef,
      servicePackage: servicePackage || undefined,
      quantity,
      itemPrice: commission.itemPrice,
      subtotal: commission.subtotal,
      marketplaceFee: commission.marketplaceFee,
      paymentProcessingFee: commission.paymentProcessingFee,
      totalCommission: commission.totalCommission,
      sellerPayout: commission.sellerPayout,
      totalCharged: commission.totalCharged,
      customizationNotes,
      shippingAddress,
      paymentStatus: "pending",
      orderStatus: "awaiting_payment",
    });

    const session = await stripeClient().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: itemTitle },
            unit_amount: Math.round(commission.totalCharged * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?itemType=${itemType}&itemId=${itemId}${
        servicePackage ? `&package=${servicePackage}` : ""
      }&qty=${quantity}`,
      metadata: { orderId: String(order._id) },
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.status(201).json({ url: session.url, orderId: order._id, commission });
  })
);

/**
 * @route POST /api/payments/confirm-session
 * Body: { sessionId }
 * Called from the /checkout/success page after Stripe redirects the buyer
 * back. Verifies payment status directly with Stripe (rather than trusting
 * the redirect alone) before marking the order paid.
 */
router.post(
  "/confirm-session",
  protect,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      res.status(404);
      throw new Error("Order not found for this checkout session");
    }
    if (String(order.buyer) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Not authorized to confirm this order");
    }

    if (order.paymentStatus === "paid") {
      return res.json({ status: "already_paid", order });
    }

    const session = await stripeClient().checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      order.paymentStatus = "paid";
      order.stripePaymentIntentId = session.payment_intent;
      order.orderStatus = order.itemType === "product" ? "in_production" : "in_progress";
      await order.save();
    } else {
      order.paymentStatus = "failed";
      await order.save();
    }

    res.json({ status: session.payment_status, order });
  })
);

export default router;
