import { Star } from "lucide-react";

// Compact rating readout. Renders nothing when a listing has no reviews yet,
// so an unreviewed card doesn't show a misleading "0.0".
export default function Rating({ rating = 0, numReviews = 0, className = "" }) {
  if (!numReviews) {
    return <span className={`text-xs text-ink-700/40 ${className}`}>No reviews yet</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-ink-700/70 ${className}`}>
      <Star className="h-3.5 w-3.5 fill-kaito-gold text-kaito-gold" />
      <span className="font-medium text-ink-900">{rating.toFixed(1)}</span>
      <span className="text-ink-700/50">({numReviews})</span>
    </span>
  );
}
