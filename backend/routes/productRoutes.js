import express from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
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
