import { useEffect, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

/**
 * Adding from a card means clicking inside a Link, so the click has to be
 * stopped from navigating to the detail page.
 */
export default function AddToCartButton({ item, variant = "icon", className = "" }) {
  const { add, has } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = has(item);

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(t);
  }, [justAdded]);

  const handle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    add(item);
    setJustAdded(true);
  };

  const label = justAdded ? "Added to cart" : inCart ? "Add another" : "Add to cart";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-label={label}
        title={label}
        className={`press flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
          justAdded
            ? "border-green-500/40 bg-green-500/15 text-green-600 dark:text-green-300"
            : "border-line bg-surface text-ink-700/75 hover:border-signal-500 hover:text-signal-500"
        } ${className}`}
      >
        {justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      className={`press btn-secondary ${justAdded ? "!border-green-500/40 !text-green-600 dark:!text-green-300" : ""} ${className}`}
    >
      {justAdded ? <Check className="mr-2 h-4 w-4" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
      {label}
    </button>
  );
}
