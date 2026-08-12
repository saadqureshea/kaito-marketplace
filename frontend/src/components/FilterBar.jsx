import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

const SORT_OPTIONS = {
  product: [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most popular" },
    { value: "rating", label: "Highest rated" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
  ],
  service: [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most popular" },
    { value: "rating", label: "Highest rated" },
  ],
  job: [
    { value: "newest", label: "Newest" },
    { value: "applicants", label: "Most applicants" },
    { value: "budget_desc", label: "Budget: high to low" },
    { value: "budget_asc", label: "Budget: low to high" },
  ],
};

/**
 * Price inputs are local state and only lift on submit, so typing "1" on the
 * way to "100" doesn't fire a request per keystroke. Sort applies immediately
 * since it's a single deliberate choice.
 */
export default function FilterBar({ type = "product", value, onChange, total }) {
  const [minPrice, setMinPrice] = useState(value.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(value.maxPrice || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMinPrice(value.minPrice || "");
    setMaxPrice(value.maxPrice || "");
  }, [value.minPrice, value.maxPrice]);

  const showsPrice = type === "product";
  const hasPriceFilter = Boolean(value.minPrice || value.maxPrice);
  const activeCount = (hasPriceFilter ? 1 : 0) + (value.sort && value.sort !== "newest" ? 1 : 0);

  const applyPrice = (e) => {
    e.preventDefault();
    onChange({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, page: 1 });
  };

  const reset = () => {
    setMinPrice("");
    setMaxPrice("");
    onChange({ minPrice: undefined, maxPrice: undefined, sort: undefined, page: 1 });
  };

  return (
    <div className="mb-6 border-b border-line pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-700/75">
          {typeof total === "number" ? (
            <>
              <span className="font-medium text-ink-950">{total}</span>{" "}
              {total === 1 ? "result" : "results"}
            </>
          ) : (
            "Loading..."
          )}
        </p>

        <div className="flex items-center gap-2">
          {showsPrice && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="press inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-700/85 transition hover:border-signal-500 hover:text-signal-500 sm:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeCount > 0 && (
                <span className="ml-0.5 rounded-full bg-signal-500 px-1.5 text-[10px] text-on-brand">
                  {activeCount}
                </span>
              )}
            </button>
          )}

          <label className="flex items-center gap-2 text-xs text-ink-700/75">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={value.sort || "newest"}
              onChange={(e) => onChange({ sort: e.target.value, page: 1 })}
              className="input !w-auto !py-1.5 text-xs"
            >
              {SORT_OPTIONS[type].map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {showsPrice && (
        <form
          onSubmit={applyPrice}
          className={`mt-3 flex-wrap items-end gap-2 ${open ? "flex" : "hidden"} sm:flex`}
        >
          <label className="text-xs text-ink-700/75">
            <span className="mb-1 block">Min price</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="input !w-24 !py-1.5 text-xs"
            />
          </label>
          <label className="text-xs text-ink-700/75">
            <span className="mb-1 block">Max price</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              className="input !w-24 !py-1.5 text-xs"
            />
          </label>
          <button type="submit" className="press btn-secondary !px-4 !py-1.5 text-xs">
            Apply
          </button>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="press inline-flex items-center gap-1 px-2 py-1.5 text-xs text-ink-700/75 hover:text-signal-500"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </form>
      )}
    </div>
  );
}
