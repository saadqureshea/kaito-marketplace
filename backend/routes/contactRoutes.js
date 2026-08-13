import express from "express";
import asyncHandler from "express-async-handler";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import ContactMessage from "../models/ContactMessage.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public form, so it gets its own tighter limiter rather than relying on the
// general /api one - same pattern as auth's login/register routes.
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

// @route POST /api/contact  (public)
router.post(
  "/",
  contactLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().isLength({ min: 10 }).withMessage("Message must be at least 10 characters"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array()[0].msg);
    }

    const { name, email, subject, message } = req.body;
    await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ message: "Message received" });
  })
);

// @route GET /api/contact  (Admin only)
router.get(
  "/",
  protect,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const messages = await ContactMessage.find().sort("-createdAt");
    res.json(messages);
  })
);

// @route DELETE /api/contact/:id  (Admin only) - dismiss a message once handled
router.delete(
  "/:id",
  protect,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      res.status(404);
      throw new Error("Message not found");
    }
    await message.deleteOne();
    res.json({ message: "Deleted" });
  })
);

export default router;
