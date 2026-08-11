import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import JobCard from "../components/JobCard.jsx";
import FilterBar from "../components/FilterBar.jsx";
import Pagination from "../components/Pagination.jsx";

const CONFIG = {
  "digital-products": {
    endpoint: "/products",
    baseParams: { listingType: "digital" },
    title: "Digital Products",
    desc: "Templates, graphics, code, e-books — instant download.",
    type: "product",
  },
  "made-to-order": {
    endpoint: "/products",
    baseParams: { listingType: "made_to_order" },
    title: "Made-to-Order",
    desc: "Custom clothing & handmade goods, tracked from maker to door.",
    type: "product",
  },
  services: {
    endpoint: "/services",
    baseParams: {},
    title: "Digital Services",
    desc: "Web/app dev, UI/UX, video editing, writing, AI automation.",
    type: "service",
  },
  "remote-work": {
    endpoint: "/jobs",
    baseParams: {},
    title: "Remote Work",
    desc: "Open roles from employers across the KAITO network.",
    type: "job",
  },
};

// Drives all four marketplace section pages off one config, since they
// share the same browse/filter/pagination shape against different endpoints.
const PER_PAGE = 12;

export default function Category({ section }) {
  const config = CONFIG[section];
  // Filter state lives in the URL so a filtered view can be shared, linked
  // and survives the back button.
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: undefined, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === null) next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(config.endpoint, {
        params: {
          ...config.baseParams,
          category: category || undefined,
          sort: sort !== "newest" ? sort : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          page,
          limit: PER_PAGE,
        },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setItems(data.items);
        setMeta({ total: data.total, page: data.page, pages: data.pages });
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setMeta({ total: 0, page: 1, pages: 1 });
      })
      .finally(() => !cancelled && setLoading(false));
    // Guards against an earlier slow request landing after a newer one.
    return () => {
      cancelled = true;
    };
  }, [section, category, sort, minPrice, maxPrice, page]);

  const filtersActive = Boolean(minPrice || maxPrice);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">{config.title}</h1>
      <p className="mb-6 mt-2 max-w-2xl text-ink-700/70">{config.desc}</p>

      <FilterBar
        type={config.type}
        value={{ sort, minPrice, maxPrice }}
        onChange={updateParams}
        total={loading ? undefined : meta.total}
      />

      {loading ? (
        config.type === "job" ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-32 animate-pulse bg-paper-50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-[4/3] w-full animate-pulse bg-paper-100" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-paper-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-paper-100" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : items.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-line p-10 text-center">
          <p className="text-ink-700/75">
            {filtersActive
              ? "No listings match those filters."
              : "Nothing here yet — approved listings will appear once sellers start publishing."}
          </p>
          {filtersActive && (
            <button
              onClick={() => updateParams({ minPrice: undefined, maxPrice: undefined, page: 1 })}
              className="press btn-secondary mt-4"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : config.type === "job" ? (
        <div className="flex flex-col gap-3">
          {items.map((j, i) => (
            <div key={j._id} className="rise" style={{ "--i": i }}>
              <JobCard job={j} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={it._id} className="rise" style={{ "--i": i }}>
              {config.type === "service" ? <ServiceCard item={it} /> : <ProductCard item={it} />}
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <Pagination page={meta.page} pages={meta.pages} onChange={(p) => updateParams({ page: p })} />
      )}
    </section>
  );
}
