import express from "express";
import asyncHandler from "express-async-handler";
import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route POST /api/uploads  (any authenticated user) - up to 6 files, field name "files"
// Returns paths under /uploads/*; frontend resolves them against the API origin.
router.post(
  "/",
  protect,
  upload.array("files", 6),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error("No files uploaded");
    }
    const urls = req.files.map((f) => `/uploads/${f.filename}`);
    res.status(201).json({ urls });
  })
);

export default router;
