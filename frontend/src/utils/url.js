// Backend returns uploaded file paths as "/uploads/xxx" (relative to its
// own origin, not the "/api" prefix). Resolve them against the API origin.
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

export function assetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
