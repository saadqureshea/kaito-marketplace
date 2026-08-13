import express from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import Review from "../models/Review.js";

const router = express.Router();

const PUBLIC_FIELDS = "name avatarUrl bio country createdAt sellerProfile role secondaryRoles";

const isSeller = (user) =>
  user && (user.role === "seller" || (user.secondaryRoles || []).includes("seller"));

/**
 * @route GET /api/sellers/:id
 * Public storefront header. sellerProfile.rating is a stored snapshot that
 * isn't recalculated on review (only Product/Service ratings are), so the
 * rating shown here is aggregated fresh from Review across everything this
 * seller has sold.
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const seller = await User.findOne({ _id: req.params.id, isActive: true }).select(PUBLIC_FIELDS);
    if (!seller || !isSeller(seller)) {
      res.status(404);
      throw new Error("Store not found");
    }

    const [agg] = await Review.aggregate([
      { $match: { seller: seller._id } },
      { $group: { _id: null, rating: { $avg: "$rating" }, numReviews: { $sum: 1 } } },
    ]);

    const { role, secondaryRoles, ...publicSeller } = seller.toObject();
    res.json({
      ...publicSeller,
      rating: agg ? Math.round(agg.rating * 10) / 10 : 0,
      numReviews: agg?.numReviews || 0,
    });
  })
);

/**
 * @route GET /api/sellers/:id/listings
 * Everything this seller currently has live, split by type so the storefront
 * can render two sections without the client having to sort it out.
 */
router.get(
  "/:id/listings",
  asyncHandler(async (req, res) => {
    const seller = await User.findOne({ _id: req.params.id, isActive: true }).select("_id role secondaryRoles");
    if (!seller || !isSeller(seller)) {
      res.status(404);
      throw new Error("Store not found");
    }

    const [products, services] = await Promise.all([
      Product.find({ seller: seller._id, status: "approved" }).sort("-createdAt").limit(48),
      Service.find({ seller: seller._id, status: "approved" }).sort("-createdAt").limit(48),
    ]);

    res.json({ products, services });
  })
);

export default router;
