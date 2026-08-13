import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

/**
 * Concrete categories drawn from live inventory rather than a hardcoded list.
 * A chip only appears if approved listings actually sit behind it, so none of
 * them can lead to an empty page.
 */
export default function CategoryChips({ limit = 12 }) {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  if (categories === null) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 w-28 animate-pulse rounded-full bg-paper-100" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  const sectionFor = (listingType) =>
    listingType === "made_to_order" ? "/made-to-order" : "/digital-products";

  return (
    <div className="flex flex-wrap gap-2">
      {categories.slice(0, limit).map((c) => (
        <Link
          key={c.name}
          to={`${sectionFor(c.listingType)}?category=${encodeURIComponent(c.name)}`}
          className="press group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-ink-900 transition hover:-translate-y-0.5 hover:border-signal-500 hover:text-signal-600"
        >
          {c.name}
          <span className="rounded-full bg-paper-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-700/75 transition group-hover:bg-signal-500/10 group-hover:text-signal-600">
            {c.count}
          </span>
        </Link>
      ))}
    </div>
  );
}
