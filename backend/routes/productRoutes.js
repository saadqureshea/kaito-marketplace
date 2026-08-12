import express from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { protect, requireRole } from "../middleware/auth.js";
import { productSort } from "../utils/sorting.js";

const router = express.Router();

// @route  GET /api/products
// Public marketplace browse - only approved listings, with search/filter/pagination
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { keyword, category, listingType, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const query = { status: "approved" };
    if (keyword) query.$text = { $search: keyword };
    if (category) query.category = category;
    if (listingType) query.listingType = listingType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Product.find(query)
        .populate("seller", "name sellerProfile.storeName sellerProfile.rating sellerProfile.isVerifiedSeller")
        .sort(productSort(sort))
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  })
);

/**
 * @route GET /api/products/:id/related
 * Content-based "you may also like": same category or overlapping tags,
 * ranked by rating then sales. Deliberately not collaborative filtering -
 * a young marketplace has too little order history for that to beat simply
 * showing well-reviewed items from the same category.
 */
router.get(
  "/:id/related",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 4, 12);
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      status: "approved",
      $or: [{ category: product.category }, { tags: { $in: product.tags || [] } }],
    })
      .populate("seller", "name sellerProfile.storeName sellerProfile.isVerifiedSeller")
      .sort("-rating -totalSold")
      .limit(limit);

    // Backfill from the same listing type so the row is never half empty.
    if (related.length < limit) {
      const filler = await Product.find({
        _id: { $nin: [product._id, ...related.map((r) => r._id)] },
        status: "approved",
        listingType: product.listingType,
      })
        .populate("seller", "name sellerProfile.storeName sellerProfile.isVerifiedSeller")
        .sort("-totalSold")
        .limit(limit - related.length);
      related.push(...filler);
    }

    res.json(related);
  })
);

/**
 * @route GET /api/products/recommended  (signed in)
 * Picks categories from what this buyer has already ordered and surfaces
 * well-rated listings from them, excluding anything already bought. Falls
 * back to top sellers for a buyer with no history, so the row always has
 * something to show.
 */
router.get(
  "/mine/recommended",
  protect,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 4, 12);

    const orders = await Order.find({ buyer: req.user._id, itemType: "product" })
      .populate("product", "category")
      .select("product");

    const boughtIds = orders.map((o) => o.product?._id).filter(Boolean);
    const categories = [...new Set(orders.map((o) => o.product?.category).filter(Boolean))];

    const query = { status: "approved", _id: { $nin: boughtIds } };
    if (categories.length) query.category = { $in: categories };

    let items = await Product.find(query)
      .populate("seller", "name sellerProfile.storeName sellerProfile.isVerifiedSeller")
      .sort("-rating -totalSold")
      .limit(limit);

    if (items.length < limit) {
      const filler = await Product.find({
        status: "approved",
        _id: { $nin: [...boughtIds, ...items.map((i) => i._id)] },
      })
        .populate("seller", "name sellerProfile.storeName sellerProfile.isVerifiedSeller")
        .sort("-totalSold")
        .limit(limit - items.length);
      items = [...items, ...filler];
    }

    res.json({ items, basedOn: categories });
  })
);

// @route  GET /api/products/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name sellerProfile"
    );
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    // Don't leak the actual file until it has been purchased - front end
    // should only request /fileUrl via the orders route after payment capture.
    const safeProduct = product.toObject();
    if (safeProduct.listingType === "digital") delete safeProduct.fileUrl;
    res.json(safeProduct);
  })
);

// @route  POST /api/products  (Seller only) - creates listing, goes to pending_review
router.post(
  "/",
  protect,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const product = await Product.create({ ...req.body, seller: req.user._id, status: "pending_review" });
    res.status(201).json(product);
  })
);

// @route  GET /api/products/mine/list  (Seller) - their own listings, any status
router.get(
  "/mine/list",
  protect,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const products = await Product.find({ seller: req.user._id }).sort("-createdAt");
    res.json(products);
  })
);

// @route  PUT /api/products/:id  (Owner seller only) - edit resets to pending_review
router.put(
  "/:id",
  protect,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    if (String(product.seller) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to edit this listing");
    }
    Object.assign(product, req.body, { status: "pending_review", rejectionReason: "" });
    const updated = await product.save();
    res.json(updated);
  })
);

// @route  DELETE /api/products/:id
router.delete(
  "/:id",
  protect,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    if (String(product.seller) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to delete this listing");
    }
    await product.deleteOne();
    res.json({ message: "Product removed" });
  })
);

export default router;
