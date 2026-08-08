import { useState } from "react";
import { Star } from "lucide-react";
import api from "../api/axios.js";

export default function ReviewForm({ orderId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/reviews", { orderId, rating, comment });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-2 rounded-lg border border-line p-3">
      {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)}>
            <Star className={`h-5 w-5 ${n <= rating ? "fill-kaito-gold text-kaito-gold" : "text-line"}`} />
          </button>
        ))}
      </div>
      <textarea
        className="input min-h-[70px] text-xs"
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button disabled={submitting} className="btn-primary w-fit !px-4 !py-1.5 text-xs">
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
