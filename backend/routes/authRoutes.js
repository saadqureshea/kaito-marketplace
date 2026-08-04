import express from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const sendTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// @route  POST /api/auth/register
router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("role").isIn(["buyer", "seller", "worker", "employer"]).withMessage("Invalid role"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array()[0].msg);
    }

    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error("An account with this email already exists");
    }

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token, // also returned in body for mobile/SPA clients using Bearer auth
    });
  })
);

// @route  POST /api/auth/login
router.post(
  "/login",
  authLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error("This account has been deactivated. Contact support.");
    }

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  })
);

// @route  POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// @route  GET /api/auth/me
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  })
);

// @route  PUT /api/auth/profile
// Updates the logged-in user's own profile, including worker professional
// profile fields (CV/portfolio links) which then go into approval queue.
router.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    const { name, bio, country, avatarUrl, professionalProfile, sellerProfile } = req.body;
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (country) user.country = country;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    if (professionalProfile) {
      user.professionalProfile = {
        ...user.professionalProfile.toObject(),
        ...professionalProfile,
        approvalStatus: "pending", // any edit to the professional profile re-triggers admin review
      };
    }

    if (sellerProfile) {
      user.sellerProfile = { ...user.sellerProfile.toObject(), ...sellerProfile };
    }

    const updated = await user.save();
    res.json(updated);
  })
);

export default router;
