import { useEffect, useState } from "react";
import Hero from "../components/Hero.jsx";
import CategoryTabs from "../components/CategoryTabs.jsx";
import ProductCard from "../components/ProductCard.jsx";
import api from "../api/axios.js";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get("/products", { params: { limit: 8 } })
      .then(({ data }) => setProducts(data.items))
      .catch(() => setProducts([]));
  }, []);

  return (
    <>
      <Hero />
      <CategoryTabs />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Fresh on the marketplace</h2>
        </div>
        {products.length === 0 ? (
          <p className="rounded-xl2 border border-dashed border-line p-10 text-center text-ink-700/60">
            No listings yet — approved products will appear here once sellers start publishing.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} item={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
