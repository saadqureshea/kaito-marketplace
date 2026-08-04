import express from "express";
import asyncHandler from "express-async-handler";
import paypal from "@paypal/checkout-server-sdk";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";
import { calculateCommission } from "../utils/commission.js";

const router = express.Router();

// ---- PayPal Sandbox client ----
function paypalClient() {
  const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
  return new paypal.core.PayPalHttpClient(environment);
}

/**
 * @route POST /api/paypal/create-order
 * Body: { itemType: "product"|"service", itemId, servicePackage?, quantity?, customizationNotes?, shippingAddress? }
 *
 * Resolves the price server-side (never trust a client-sent price),
 * computes the 15/5/20/80 commission split, creates the PayPal order
 * for the FULL buyer-facing amount, and stores a "pending" Order.
 */
router.post(
  "/create-order",
  protect,
  asyncHandler(async (req, res) => {
    const { itemType, itemId, servicePackage, quantity = 1, customizationNotes, shippingAddress } = req.body;

    let unitPrice, sellerId, productRef = null, serviceRef = null;

    if (itemType === "product") {
      const product = await Product.findById(itemId);
      if (!product || product.status !== "approved") {
        res.status(404);
        throw new Error("Product not available");
      }
      unitPrice = product.price;
      sellerId = product.seller;
      productRef = product._id;
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

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: String(order._id),
          amount: {
            currency_code: "USD",
            value: commission.totalCharged.toFixed(2),
          },
          description: `KAITO MarketPlace order ${order._id}`,
        },
      ],
      application_context: {
        brand_name: "KAITO MarketPlace",
        shipping_preference: itemType === "product" ? "SET_PROVIDED_ADDRESS" : "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    });

    const paypalOrder = await paypalClient().execute(request);

    order.paypalOrderId = paypalOrder.result.id;
    await order.save();

    res.status(201).json({ paypalOrderId: paypalOrder.result.id, orderId: order._id, commission });
  })
);

/**
 * @route POST /api/paypal/capture-order/:paypalOrderId
 * Captures the funds after the buyer approves in the PayPal Sandbox UI,
 * marks our Order as paid, and flips it into production/in-progress.
 */
router.post(
  "/capture-order/:paypalOrderId",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ paypalOrderId: req.params.paypalOrderId });
    if (!order) {
      res.status(404);
      throw new Error("Order not found for this PayPal order id");
    }
    if (String(order.buyer) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Not authorized to capture this order");
    }

    const request = new paypal.orders.OrdersCaptureRequest(req.params.paypalOrderId);
    request.requestBody({});
    const capture = await paypalClient().execute(request);

    const captureStatus = capture.result.status; // "COMPLETED" on success
    const captureId = capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    if (captureStatus === "COMPLETED") {
      order.paymentStatus = "paid";
      order.paypalCaptureId = captureId;
      order.orderStatus = order.itemType === "product" ? "in_production" : "in_progress";
      await order.save();
    } else {
      order.paymentStatus = "failed";
      await order.save();
    }

    res.json({ status: captureStatus, order });
  })
);

export default router;
