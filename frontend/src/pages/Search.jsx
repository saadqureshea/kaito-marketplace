import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import JobCard from "../components/JobCard.jsx";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState({ products: [], services: [], jobs: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setResults({ products: [], services: [], jobs: [] });
      return;
    }
    setLoading(true);
    Promise.all([
      api.get("/products", { params: { keyword: q, limit: 8 } }),
      api.get("/services", { params: { keyword: q, limit: 8 } }),
      api.get("/jobs", { params: { keyword: q, limit: 8 } }),
    ])
      .then(([p, s, j]) => setResults({ products: p.data.items, services: s.data.items, jobs: j.data.items }))
      .catch(() => setResults({ products: [], services: [], jobs: [] }))
      .finally(() => setLoading(false));
  }, [q]);

  const total = results.products.length + results.services.length + results.jobs.length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold">Search results for &ldquo;{q}&rdquo;</h1>

      {loading ? (
        <p className="mt-10 text-center text-sm text-ink-700/50">Searching...</p>
      ) : total === 0 ? (
        <p className="mt-10 rounded-xl2 border border-dashed border-line p-10 text-center text-ink-700/60">
          No results for &ldquo;{q}&rdquo;.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {results.products.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold">Products</h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {results.products.map((p) => (
                  <ProductCard key={p._id} item={p} />
                ))}
              </div>
            </div>
          )}
          {results.services.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold">Services</h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {results.services.map((s) => (
                  <ServiceCard key={s._id} item={s} />
                ))}
              </div>
            </div>
          )}
          {results.jobs.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold">Jobs</h2>
              <div className="flex flex-col gap-3">
                {results.jobs.map((j) => (
                  <JobCard key={j._id} job={j} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
