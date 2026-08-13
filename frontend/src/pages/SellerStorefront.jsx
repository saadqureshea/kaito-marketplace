import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, CalendarDays, ShoppingBag } from "lucide-react";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import VerifiedMark from "../components/VerifiedMark.jsx";
import Rating from "../components/Rating.jsx";
import { assetUrl } from "../utils/url.js";

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function memberSince(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function SellerStorefront() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setSeller(null);
    setListings(null);
    setNotFound(false);
    Promise.all([api.get(`/sellers/${id}`), api.get(`/sellers/${id}/listings`)])
      .then(([sellerRes, listingsRes]) => {
        setSeller(sellerRes.data);
        setListings(listingsRes.data);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-16 text-center text-ink-700/75">Store not found.</p>
    );
  }
  if (!seller) return null;

  const store = seller.sellerProfile || {};
  const storeName = store.storeName || seller.name;
  const totalListings = (listings?.products.length || 0) + (listings?.services.length || 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {seller.avatarUrl ? (
            <img
              src={assetUrl(seller.avatarUrl)}
              alt=""
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-signal-500/10 font-display text-xl font-semibold text-signal-600">
              {initials(storeName)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-ink-950">{storeName}</h1>
              {store.isVerifiedSeller && <VerifiedMark withLabel />}
            </div>
            {store.storeName && (
              <p className="mt-0.5 text-xs text-ink-700/70">Sold by {seller.name}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-700/75">
              {seller.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {seller.country}
                </span>
              )}
              {seller.createdAt && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  On KAITO since {memberSince(seller.createdAt)}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" />
                {totalListings} {totalListings === 1 ? "listing" : "listings"}
              </span>
            </div>

            <div className="mt-3">
              <Rating rating={seller.rating} numReviews={seller.numReviews} />
            </div>
          </div>
        </div>

        {store.storeDescription && (
          <div className="mt-6 border-t border-line pt-6">
            <h2 className="mb-2 font-display text-lg font-semibold">About this store</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700/85">
              {store.storeDescription}
            </p>
          </div>
        )}
        {!store.storeDescription && seller.bio && (
          <div className="mt-6 border-t border-line pt-6">
            <h2 className="mb-2 font-display text-lg font-semibold">About</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700/85">{seller.bio}</p>
          </div>
        )}
      </div>

      {listings === null ? (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-paper-50" />
          ))}
        </div>
      ) : (
        <>
          {listings.products.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 font-display text-lg font-semibold">Products</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {listings.products.map((item) => (
                  <ProductCard key={item._id} item={{ ...item, seller }} />
                ))}
              </div>
            </section>
          )}

          {listings.services.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 font-display text-lg font-semibold">Services</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {listings.services.map((item) => (
                  <ServiceCard key={item._id} item={{ ...item, seller }} />
                ))}
              </div>
            </section>
          )}

          {totalListings === 0 && (
            <div className="mt-10 rounded-xl2 border border-dashed border-line p-10 text-center">
              <p className="text-ink-700/75">This store doesn't have any live listings right now.</p>
            </div>
          )}
        </>
      )}

      <p className="mt-8">
        <Link to="/digital-products" className="text-sm text-signal-500 hover:underline">
          &larr; Back to browsing
        </Link>
      </p>
    </div>
  );
}
