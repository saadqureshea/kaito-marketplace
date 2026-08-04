import express from "express";
import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

async function recalcRating(itemType, itemId) {
  const Model = itemType === "product" ? Product : Service;
  const reviews = await Review.find({ [itemType]: itemId });
  const numReviews = reviews.length;
  const rating = numReviews === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;
  await Model.findByIdAndUpdate(itemId, { rating: Math.round(rating * 10) / 10, numReviews });
}

// @route GET /api/reviews/mine  (Buyer - orders they've already reviewed)
router.get(
  "/mine",
  protect,
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ buyer: req.user._id });
    res.json(reviews);
  })
);

// @route GET /api/reviews/product/:productId
router.get(
  "/product/:productId",
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("buyer", "name avatarUrl")
      .sort("-createdAt");
    res.json(reviews);
  })
);

// @route GET /api/reviews/service/:serviceId
router.get(
  "/service/:serviceId",
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate("buyer", "name avatarUrl")
      .sort("-createdAt");
    res.json(reviews);
  })
);

// @route POST /api/reviews  (Buyer only, one review per completed order)
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { orderId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error("Rating must be between 1 and 5");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (String(order.buyer) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Not authorized to review this order");
    }
    if (order.orderStatus !== "completed") {
      res.status(400);
      throw new Error("You can only review an order once it is completed");
    }

    const existing = await Review.findOne({ order: order._id });
    if (existing) {
      res.status(400);
      throw new Error("You already reviewed this order");
    }

    const itemId = order.itemType === "product" ? order.product : order.service;

    const review = await Review.create({
      order: order._id,
      itemType: order.itemType,
      product: order.itemType === "product" ? order.product : undefined,
      service: order.itemType === "service" ? order.service : undefined,
      buyer: req.user._id,
      seller: order.seller,
      rating,
      comment,
    });

    await recalcRating(order.itemType, itemId);

    res.status(201).json(review);
  })
);

export default router;
