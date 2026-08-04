import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import JobCard from "../components/JobCard.jsx";

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
export default function Category({ section }) {
  const config = CONFIG[section];
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const category = searchParams.get("category") || "";

  useEffect(() => {
    setLoading(true);
    api
      .get(config.endpoint, { params: { ...config.baseParams, category: category || undefined, limit: 24 } })
      .then(({ data }) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [section, category]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">{config.title}</h1>
      <p className="mt-2 max-w-2xl text-ink-700/70">{config.desc}</p>

      {loading ? (
        <p className="mt-10 text-center text-sm text-ink-700/50">Loading...</p>
      ) : items.length === 0 ? (
        <p className="mt-10 rounded-xl2 border border-dashed border-line p-10 text-center text-ink-700/60">
          Nothing here yet — approved listings will appear once sellers start publishing.
        </p>
      ) : config.type === "job" ? (
        <div className="mt-8 flex flex-col gap-3">
          {items.map((j) => (
            <JobCard key={j._id} job={j} />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <ProductCard key={it._id} item={it} type={config.type} />
          ))}
        </div>
      )}
    </section>
  );
}
