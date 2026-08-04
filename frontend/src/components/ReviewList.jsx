import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import api from "../api/axios.js";

export default function ReviewList({ itemType, itemId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!itemId) return;
    api
      .get(`/reviews/${itemType}/${itemId}`)
      .then(({ data }) => setReviews(data))
      .catch(() => setReviews([]));
  }, [itemType, itemId]);

  if (reviews.length === 0) {
    return <p className="text-sm text-ink-700/60">No reviews yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((r) => (
        <div key={r._id} className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-950">{r.buyer?.name || "Buyer"}</span>
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < r.rating ? "fill-kaito-gold text-kaito-gold" : "text-line"}`}
                />
              ))}
            </span>
          </div>
          {r.comment && <p className="mt-2 text-sm text-ink-700/80">{r.comment}</p>}
          <p className="mt-2 text-xs text-ink-700/40">{new Date(r.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
