import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import TalentCard from "../components/TalentCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFavourites } from "../context/FavouritesContext.jsx";

export default function Favourites() {
  const { ids } = useFavourites();
  const [data, setData] = useState(null);

  // Refetches when the saved set changes, so removing something here clears
  // the card rather than leaving it until a manual reload.
  useEffect(() => {
    let cancelled = false;
    api
      .get("/favourites")
      .then(({ data }) => !cancelled && setData(data))
      .catch(() => !cancelled && setData({ products: [], services: [], talent: [], total: 0 }));
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (data === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-paper-50" />
          ))}
        </div>
      </div>
    );
  }

  if (data.total === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper-100 text-ink-700/50">
          <Heart className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold">Nothing saved yet</h1>
        <p className="mt-2 text-sm text-ink-700/75">
          Tap the heart on any listing or professional to keep it here for later.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/digital-products" className="btn-primary">
            Browse products
          </Link>
          <Link to="/talent" className="btn-secondary">
            Browse talent
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Saved</h1>
      <p className="mb-10 mt-2 text-ink-700/75">
        {data.total} saved item{data.total === 1 ? "" : "s"}
      </p>

      {data.products.length > 0 && (
        <section className="mb-12">
          <SectionHeader eyebrow="Products" title="Saved products" />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {data.products.map((p, i) => (
              <div key={p._id} className="rise" style={{ "--i": i }}>
                <ProductCard item={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {data.services.length > 0 && (
        <section className="mb-12">
          <SectionHeader eyebrow="Services" title="Saved services" />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {data.services.map((s, i) => (
              <div key={s._id} className="rise" style={{ "--i": i }}>
                <ServiceCard item={s} />
              </div>
            ))}
          </div>
        </section>
      )}

      {data.talent.length > 0 && (
        <section className="mb-12">
          <SectionHeader eyebrow="Talent" title="Saved professionals" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.talent.map((w, i) => (
              <div key={w._id} className="rise" style={{ "--i": i }}>
                <TalentCard worker={w} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
