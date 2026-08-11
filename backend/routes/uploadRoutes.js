import express from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import { uploadBuffer, findFile, openDownloadStream } from "../utils/gridfs.js";
import Application from "../models/Application.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * Reads the current user if a token is present, but doesn't demand one.
 * Public files must stay reachable by logged-out visitors, while private
 * files still need to know who is asking.
 */
async function optionalUser(req) {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(id).select("_id role");
  } catch {
    return null;
  }
}

/**
 * A private file (a CV) is readable by the person who uploaded it, an admin,
 * or an employer who actually received an application citing that file.
 * Anyone else gets a 403 - previously an unguessable filename was the only
 * thing protecting someone's name, address and work history.
 */
async function canRead(file, user) {
  if (file.metadata?.visibility !== "private") return true;
  if (!user) return false;
  if (user.role === "admin") return true;
  if (String(file.metadata?.owner) === String(user._id)) return true;

  const url = `/api/uploads/${file._id}`;
  const isRecipient = await Application.exists({ cvUrl: url, employer: user._id });
  return Boolean(isRecipient);
}

/**
 * @route POST /api/uploads
 * Field name "files", up to 6. Pass ?visibility=private for CVs.
 */
router.post(
  "/",
  protect,
  upload.array("files", 6),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error("No files uploaded");
    }

    const visibility = req.query.visibility === "private" ? "private" : "public";

    const stored = await Promise.all(
      req.files.map((f) =>
        uploadBuffer({
          buffer: f.buffer,
          filename: f.originalname,
          contentType: f.mimetype,
          metadata: { owner: req.user._id, visibility, uploadedAt: new Date() },
        })
      )
    );

    res.status(201).json({ urls: stored.map((s) => `/api/uploads/${s.id}`) });
  })
);

/**
 * @route GET /api/uploads/:id
 * Streams a stored file, enforcing visibility.
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const file = await findFile(req.params.id);
    if (!file) {
      res.status(404);
      throw new Error("File not found");
    }

    const user = await optionalUser(req);
    if (!(await canRead(file, user))) {
      res.status(403);
      throw new Error("Not authorized to view this file");
    }

    res.set("Content-Type", file.contentType || "application/octet-stream");
    res.set("Content-Length", String(file.length));
    // Private files must not be kept in shared caches.
    res.set(
      "Cache-Control",
      file.metadata?.visibility === "private" ? "private, max-age=0, no-store" : "public, max-age=31536000, immutable"
    );
    if (file.filename) {
      res.set("Content-Disposition", `inline; filename="${encodeURIComponent(file.filename)}"`);
    }

    const stream = openDownloadStream(req.params.id);
    stream.on("error", () => res.destroy());
    stream.pipe(res);
  })
);

export default router;
