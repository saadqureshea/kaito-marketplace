import express from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Favourite from "../models/Favourite.js";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

const TALENT_FIELDS = [
  "name",
  "avatarUrl",
  "country",
  "professionalProfile.headline",
  "professionalProfile.skills",
  "professionalProfile.hourlyRate",
  "professionalProfile.yearsExperience",
  "professionalProfile.timezone",
  "professionalProfile.availability",
].join(" ");

/**
 * @route GET /api/favourites
 * Returns the saved items themselves, grouped by type, with anything since
 * deleted or unapproved filtered out so the page never renders dead cards.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const favs = await Favourite.find({ user: req.user._id }).sort("-createdAt");

    const idsOf = (type) => favs.filter((f) => f.itemType === type).map((f) => f.item);

    const [products, services, talent] = await Promise.all([
      Product.find({ _id: { $in: idsOf("product") }, status: "approved" }).populate(
        "seller",
        "name sellerProfile.storeName sellerProfile.isVerifiedSeller"
      ),
      Service.find({ _id: { $in: idsOf("service") }, status: "approved" }).populate(
        "seller",
        "name sellerProfile"
      ),
      User.find({
        _id: { $in: idsOf("talent") },
        isActive: true,
        "professionalProfile.approvalStatus": "approved",
      }).select(TALENT_FIELDS),
    ]);

    res.json({ products, services, talent, total: products.length + services.length + talent.length });
  })
);

/**
 * @route GET /api/favourites/ids
 * Just the keys, for cheaply deciding which hearts render filled.
 */
router.get(
  "/ids",
  asyncHandler(async (req, res) => {
    const favs = await Favourite.find({ user: req.user._id }).select("itemType item");
    res.json(favs.map((f) => `${f.itemType}:${f.item}`));
  })
);

/**
 * @route POST /api/favourites   Body: { itemType, itemId }
 * Idempotent - saving something already saved returns the existing record.
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { itemType, itemId } = req.body;

    if (!["product", "service", "talent"].includes(itemType)) {
      res.status(400);
      throw new Error("itemType must be 'product', 'service' or 'talent'");
    }
    if (!mongoose.isValidObjectId(itemId)) {
      res.status(400);
      throw new Error("Invalid item id");
    }

    // Confirm the target exists before saving a reference to it.
    const exists =
      itemType === "product"
        ? await Product.exists({ _id: itemId, status: "approved" })
        : itemType === "service"
        ? await Service.exists({ _id: itemId, status: "approved" })
        : await User.exists({ _id: itemId, "professionalProfile.approvalStatus": "approved" });

    if (!exists) {
      res.status(404);
      throw new Error("That item is no longer available");
    }

    const favourite = await Favourite.findOneAndUpdate(
      { user: req.user._id, itemType, item: itemId },
      { $setOnInsert: { user: req.user._id, itemType, item: itemId } },
      { new: true, upsert: true }
    );

    res.status(201).json(favourite);
  })
);

/**
 * @route DELETE /api/favourites/:itemType/:itemId
 */
router.delete(
  "/:itemType/:itemId",
  asyncHandler(async (req, res) => {
    await Favourite.deleteOne({
      user: req.user._id,
      itemType: req.params.itemType,
      item: req.params.itemId,
    });
    res.json({ message: "Removed from favourites" });
  })
);

export default router;
