import express from "express";
import asyncHandler from "express-async-handler";
import Service from "../models/Service.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { keyword, category, page = 1, limit = 12 } = req.query;
    const query = { status: "approved" };
    if (keyword) query.$text = { $search: keyword };
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Service.find(query).populate("seller", "name sellerProfile").sort("-createdAt").skip(skip).limit(Number(limit)),
      Service.countDocuments(query),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id).populate("seller", "name sellerProfile");
    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }
    res.json(service);
  })
);

router.post(
  "/",
  protect,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const service = await Service.create({ ...req.body, seller: req.user._id, status: "pending_review" });
    res.status(201).json(service);
  })
);

router.get(
  "/mine/list",
  protect,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const services = await Service.find({ seller: req.user._id }).sort("-createdAt");
    res.json(services);
  })
);

router.put(
  "/:id",
  protect,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }
    if (String(service.seller) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized");
    }
    Object.assign(service, req.body, { status: "pending_review", rejectionReason: "" });
    const updated = await service.save();
    res.json(updated);
  })
);

router.delete(
  "/:id",
  protect,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }
    if (String(service.seller) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized");
    }
    await service.deleteOne();
    res.json({ message: "Service removed" });
  })
);

export default router;
