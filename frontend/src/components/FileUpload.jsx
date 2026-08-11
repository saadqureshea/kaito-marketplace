import { useId, useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import api from "../api/axios.js";
import { assetUrl } from "../utils/url.js";

// Reusable upload control backed by POST /api/uploads. `value` is always
// an array of stored paths (["/uploads/xxx", ...]); pass multiple={false}
// for single-file fields like a CV.
export default function FileUpload({ value = [], onChange, multiple = true, accept = "image/*", label = "Upload images" }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const isImage = accept.startsWith("image");

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const { data } = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(multiple ? [...value, ...data.urls] : data.urls.slice(0, 1));
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFiles}
        className="hidden"
        id={inputId}
      />
      <label htmlFor={inputId} className="btn-secondary w-fit cursor-pointer !px-4 !py-2 text-xs">
        {uploading ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="mr-1.5 h-3.5 w-3.5" />
        )}
        {uploading ? "Uploading..." : label}
      </label>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-300">{error}</p>}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((url, i) => (
            <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-line">
              {isImage ? (
                <img src={assetUrl(url)} alt="" className="h-full w-full object-cover" />
              ) : (
                <a
                  href={assetUrl(url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-full w-full items-center justify-center bg-paper-100 p-1 text-center text-[10px] text-ink-700/75"
                >
                  File {i + 1}
                </a>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-0.5 top-0.5 rounded-full bg-ink-950/70 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
