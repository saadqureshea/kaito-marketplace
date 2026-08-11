import multer from "multer";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/epub+zip",
]);

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    cb(new Error("Unsupported file type. Allowed: JPG, PNG, WEBP, GIF, PDF, ZIP, EPUB"));
    return;
  }
  cb(null, true);
}

// Files are buffered in memory and then streamed into GridFS (see
// utils/gridfs.js). Local disk isn't an option: the host's filesystem is
// ephemeral, so anything written there is lost on the next deploy - which
// previously left employers with dead "View CV" links.
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

export { ALLOWED_MIME };
