import express from "express";
import asyncHandler from "express-async-handler";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { protect, requireRole } from "../middleware/auth.js";
import { jobSort } from "../utils/sorting.js";

const router = express.Router();

// ---------- Job postings ----------

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { keyword, category, employmentType, sort, page = 1, limit = 12 } = req.query;
    const query = { status: "open" };
    if (keyword) query.$text = { $search: keyword };
    if (category) query.category = category;
    if (employmentType) query.employmentType = employmentType;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Job.find(query).populate("employer", "name sellerProfile.storeName").sort(jobSort(sort)).skip(skip).limit(Number(limit)),
      Job.countDocuments(query),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id).populate("employer", "name bio country");
    if (!job) {
      res.status(404);
      throw new Error("Job not found");
    }
    res.json(job);
  })
);

router.post(
  "/",
  protect,
  requireRole("employer", "admin"),
  asyncHandler(async (req, res) => {
    const job = await Job.create({ ...req.body, employer: req.user._id, status: "pending_review" });
    res.status(201).json(job);
  })
);

router.get(
  "/mine/list",
  protect,
  requireRole("employer", "admin"),
  asyncHandler(async (req, res) => {
    const jobs = await Job.find({ employer: req.user._id }).sort("-createdAt");
    res.json(jobs);
  })
);

router.put(
  "/:id",
  protect,
  requireRole("employer", "admin"),
  asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404);
      throw new Error("Job not found");
    }
    if (String(job.employer) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized");
    }
    Object.assign(job, req.body, { status: "pending_review", rejectionReason: "" });
    const updated = await job.save();
    res.json(updated);
  })
);

// ---------- Applications (Worker applies to Job) ----------

// @route POST /api/jobs/:id/apply  (Worker only, must have an approved professional profile)
router.post(
  "/:id/apply",
  protect,
  requireRole("worker"),
  asyncHandler(async (req, res) => {
    if (req.user.professionalProfile.approvalStatus !== "approved") {
      res.status(403);
      throw new Error("Your professional profile must be approved before applying to jobs");
    }

    const job = await Job.findById(req.params.id);
    if (!job || job.status !== "open") {
      res.status(404);
      throw new Error("Job not found or no longer accepting applications");
    }

    const { coverLetter, cvUrl, portfolioUrl, proposedRate } = req.body;

    const application = await Application.create({
      job: job._id,
      worker: req.user._id,
      employer: job.employer,
      coverLetter,
      cvUrl,
      portfolioUrl,
      proposedRate,
    });

    job.applicantCount += 1;
    await job.save();

    res.status(201).json(application);
  })
);

// @route GET /api/jobs/:id/applications  (Employer - owner only)
router.get(
  "/:id/applications",
  protect,
  requireRole("employer", "admin"),
  asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404);
      throw new Error("Job not found");
    }
    if (String(job.employer) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized");
    }
    const applications = await Application.find({ job: job._id }).populate(
      "worker",
      "name professionalProfile avatarUrl"
    );
    res.json(applications);
  })
);

// @route GET /api/jobs/applications/mine  (Worker - their own applications)
router.get(
  "/applications/mine",
  protect,
  requireRole("worker"),
  asyncHandler(async (req, res) => {
    const applications = await Application.find({ worker: req.user._id }).populate("job", "title employer status");
    res.json(applications);
  })
);

// @route PUT /api/jobs/applications/:appId/status  (Employer updates hiring status)
router.put(
  "/applications/:appId/status",
  protect,
  requireRole("employer", "admin"),
  asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.appId);
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }
    if (String(application.employer) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized");
    }
    application.status = req.body.status;
    const updated = await application.save();
    res.json(updated);
  })
);

// @route POST /api/jobs/applications/:appId/messages  (Employer <-> Worker thread)
router.post(
  "/applications/:appId/messages",
  protect,
  asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.appId);
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }
    const isParticipant =
      String(application.worker) === String(req.user._id) ||
      String(application.employer) === String(req.user._id);
    if (!isParticipant && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to message on this application");
    }

    application.messages.push({ sender: req.user._id, body: req.body.body });
    await application.save();
    res.status(201).json(application.messages[application.messages.length - 1]);
  })
);

export default router;
