import mongoose from "mongoose";

const BUCKET_NAME = "uploads";

let bucket = null;

/**
 * GridFS bucket over the existing application database. Files live alongside
 * the data rather than on the host filesystem, which is ephemeral - and
 * because they're then served through our own route, private files (CVs) can
 * be permission-checked on the way out.
 */
export function getBucket() {
  if (bucket) return bucket;
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database not connected yet");
  bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET_NAME });
  return bucket;
}

/**
 * @returns {Promise<{ id: string, filename: string }>}
 */
export function uploadBuffer({ buffer, filename, contentType, metadata }) {
  return new Promise((resolve, reject) => {
    const stream = getBucket().openUploadStream(filename, { contentType, metadata });
    stream.on("error", reject);
    stream.on("finish", () => resolve({ id: String(stream.id), filename }));
    stream.end(buffer);
  });
}

export async function findFile(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const [file] = await getBucket()
    .find({ _id: new mongoose.Types.ObjectId(id) })
    .limit(1)
    .toArray();
  return file || null;
}

export function openDownloadStream(id) {
  return getBucket().openDownloadStream(new mongoose.Types.ObjectId(id));
}

export async function deleteFile(id) {
  if (!mongoose.isValidObjectId(id)) return;
  try {
    await getBucket().delete(new mongoose.Types.ObjectId(id));
  } catch {
    /* already gone */
  }
}

export { BUCKET_NAME };
