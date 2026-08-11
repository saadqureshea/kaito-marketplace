import { Link } from "react-router-dom";
import { ImageOff, ShoppingBag } from "lucide-react";
import Badge from "./Badge.jsx";
import Rating from "./Rating.jsx";
import { assetUrl } from "../utils/url.js";
import { isNew, money, compact } from "../utils/format.js";

const BESTSELLER_THRESHOLD = 50;

export default function ProductCard({ item }) {
  const image = item.images?.[0];
  const madeToOrder = item.listingType === "made_to_order";
  const storeName = item.seller?.sellerProfile?.storeName || item.seller?.name;

  return (
    <Link
      to={`/products/${item._id}`}
      className="card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-signal-500 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-100">
        {image ? (
          <img
            src={assetUrl(image)}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink-700/25">
            <ImageOff className="h-6 w-6" />
            <span className="text-[11px]">No image</span>
          </div>
        )}

        {/* One badge only — stacking "Bestseller" and "New" on the same card
            makes both read as decoration rather than signal. */}
        <div className="absolute left-2.5 top-2.5">
          {item.totalSold >= BESTSELLER_THRESHOLD ? (
            <Badge tone="gold">Bestseller</Badge>
          ) : isNew(item.createdAt) ? (
            <Badge tone="signal">New</Badge>
          ) : null}
        </div>

        <div className="absolute right-2.5 top-2.5">
          <Badge tone="neutral" className="bg-surface/90 backdrop-blur-sm">
            {madeToOrder ? "Made-to-Order" : "Digital"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {item.category && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-signal-500">
            {item.category}
          </p>
        )}

        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink-950 group-hover:text-signal-600">
          {item.title}
        </h3>

        {storeName && <p className="mt-1 text-xs text-ink-700/75">by {storeName}</p>}

        <div className="mt-2 flex items-center gap-3">
          <Rating rating={item.rating} numReviews={item.numReviews} />
          {item.totalSold > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-700/75">
              <ShoppingBag className="h-3 w-3" />
              {compact(item.totalSold)} sold
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="font-display text-lg font-semibold text-ink-950">
            {money(item.price, item.currency)}
          </span>
          {madeToOrder && item.productionDetails?.leadTimeDays && (
            <span className="text-[11px] text-ink-700/75">
              ~{item.productionDetails.leadTimeDays}d to make
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
