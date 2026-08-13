import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useFavourites } from "../context/FavouritesContext.jsx";

/**
 * Hearts usually sit inside a card that is itself a link, so the click has to
 * be stopped from navigating.
 */
export default function FavouriteButton({ itemType, itemId, className = "", floating = false }) {
  const { isFavourite, toggle } = useFavourites();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const saved = isFavourite(itemType, itemId);

  const handle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    const result = await toggle(itemType, itemId);
    if (result?.needsAuth) return navigate("/login?next=/favourites");
    if (result?.error) setError(result.error);
  };

  const base = floating
    ? "absolute right-2.5 top-2.5 h-8 w-8 bg-surface/90 backdrop-blur-sm border border-line"
    : "h-8 w-8 border border-line bg-surface";

  return (
    <button
      type="button"
      onClick={handle}
      aria-pressed={saved}
      aria-label={saved ? "Remove from favourites" : "Save to favourites"}
      title={error || (saved ? "Saved" : "Save")}
      className={`press z-10 flex shrink-0 items-center justify-center rounded-full transition hover:border-signal-500 ${base} ${
        saved ? "text-red-500" : "text-ink-700/70 hover:text-signal-500"
      } ${className}`}
    >
      <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}
