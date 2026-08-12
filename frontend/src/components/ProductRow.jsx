import { useEffect, useState } from "react";
import ProductCard from "./ProductCard.jsx";
import SectionHeader from "./SectionHeader.jsx";
import api from "../api/axios.js";

/**
 * Fetches a short list of products and renders it as a titled row. Renders
 * nothing at all when the request returns empty, so an unpopulated
 * recommendation row never leaves an orphan heading on the page.
 */
export default function ProductRow({ endpoint, eyebrow, title, subtitle, to, limit = 4 }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get(endpoint, { params: { limit } })
      .then(({ data }) => {
        if (cancelled) return;
        setItems(Array.isArray(data) ? data : data.items || []);
      })
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [endpoint, limit]);

  if (items === null) {
    return (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[4/3] w-full animate-pulse bg-paper-100" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-paper-100" />
              <div className="h-4 w-full animate-pulse rounded bg-paper-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <>
      <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} to={to} />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p, i) => (
          <div key={p._id} className="rise" style={{ "--i": i }}>
            <ProductCard item={p} />
          </div>
        ))}
      </div>
    </>
  );
}
