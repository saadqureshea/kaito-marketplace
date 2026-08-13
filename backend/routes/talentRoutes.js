import express from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const router = express.Router();

/**
 * Fields safe to expose on a public talent listing.
 *
 * cvUrl is deliberately absent: a CV is private and only reachable through
 * /api/uploads, which permission-checks the request. Email and
 * rejectionReason are withheld too - the first invites scraping, the second
 * is between the worker and the review team.
 */
const PUBLIC_FIELDS = [
  "name",
  "avatarUrl",
  "bio",
  "country",
  "createdAt",
  "professionalProfile.headline",
  "professionalProfile.skills",
  "professionalProfile.hourlyRate",
  "professionalProfile.portfolioUrl",
  "professionalProfile.yearsExperience",
  "professionalProfile.timezone",
  "professionalProfile.availability",
  "professionalProfile.languages",
].join(" ");

const SORTS = {
  newest: "-createdAt",
  rate_asc: "professionalProfile.hourlyRate",
  rate_desc: "-professionalProfile.hourlyRate",
  experience: "-professionalProfile.yearsExperience",
};

// User input goes into a regex, so metacharacters have to be neutralised -
// otherwise a search for "c++" throws, and a crafted pattern could hang the
// query.
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * @route GET /api/talent
 * Public directory of workers whose professional profile an admin approved.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { keyword, skill, availability, minRate, maxRate, sort, page = 1, limit = 12 } = req.query;

    const query = {
      role: "worker",
      isActive: true,
      "professionalProfile.approvalStatus": "approved",
    };

    if (skill) query["professionalProfile.skills"] = new RegExp(`^${escapeRegex(skill)}$`, "i");

    if (availability && availability !== "any") {
      query["professionalProfile.availability"] = availability;
    }

    if (keyword) {
      const rx = new RegExp(escapeRegex(keyword), "i");
      query.$or = [
        { name: rx },
        { "professionalProfile.headline": rx },
        { "professionalProfile.skills": rx },
      ];
    }

    if (minRate || maxRate) {
      query["professionalProfile.hourlyRate"] = {};
      if (minRate) query["professionalProfile.hourlyRate"].$gte = Number(minRate);
      if (maxRate) query["professionalProfile.hourlyRate"].$lte = Number(maxRate);
    }

    const perPage = Math.min(Number(limit) || 12, 48);
    const skip = (Math.max(1, Number(page)) - 1) * perPage;

    const [items, total] = await Promise.all([
      User.find(query).select(PUBLIC_FIELDS).sort(SORTS[sort] || SORTS.newest).skip(skip).limit(perPage),
      User.countDocuments(query),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / perPage) });
  })
);

/**
 * @route GET /api/talent/skills
 * Distinct skills across approved profiles, for the filter chips.
 */
router.get(
  "/skills",
  asyncHandler(async (req, res) => {
    const skills = await User.distinct("professionalProfile.skills", {
      role: "worker",
      isActive: true,
      "professionalProfile.approvalStatus": "approved",
    });
    res.json(skills.filter(Boolean).sort());
  })
);

/**
 * @route GET /api/talent/:id
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const worker = await User.findOne({
      _id: req.params.id,
      role: "worker",
      isActive: true,
      "professionalProfile.approvalStatus": "approved",
    }).select(PUBLIC_FIELDS);

    if (!worker) {
      res.status(404);
      throw new Error("Talent profile not found");
    }
    res.json(worker);
  })
);

export default router;
