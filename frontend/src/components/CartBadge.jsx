import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

export default function CartBadge({ className = "" }) {
  const { count, lastAddedAt } = useCart();
  const [bump, setBump] = useState(false);

  // Re-trigger on every add, including adding the same item twice, which is
  // why this keys off a timestamp rather than the count.
  useEffect(() => {
    if (!lastAddedAt) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 420);
    return () => clearTimeout(t);
  }, [lastAddedAt]);

  return (
    <Link
      to="/cart"
      aria-label={count ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart, empty"}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-700/75 transition hover:border-signal-500 hover:text-signal-500 ${className}`}
    >
      <ShoppingCart className="h-4 w-4" />
      {count > 0 && (
        <span
          className={`absolute -right-1 -top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-signal-500 px-1 text-[10px] font-semibold leading-none text-on-brand ${
            bump ? "animate-bump" : ""
          }`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
