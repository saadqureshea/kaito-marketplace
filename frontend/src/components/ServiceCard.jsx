import { Link } from "react-router-dom";
import { ImageOff, Clock, Layers } from "lucide-react";
import Badge from "./Badge.jsx";
import Rating from "./Rating.jsx";
import { assetUrl } from "../utils/url.js";
import { money, compact, titleize } from "../utils/format.js";

const TIER_ORDER = ["basic", "standard", "premium"];

// Services sell as tiered packages, so the card leads with the entry tier's
// price + delivery and advertises how many tiers are on offer.
export default function ServiceCard({ item }) {
  const image = item.images?.[0];
  const storeName = item.seller?.sellerProfile?.storeName || item.seller?.name;

  const tiers = [...(item.packages || [])].sort(
    (a, b) => TIER_ORDER.indexOf(a.name) - TIER_ORDER.indexOf(b.name)
  );
  const entry = tiers[0];

  return (
    <Link
      to={`/services/${item._id}`}
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
        {tiers.length > 1 && (
          <div className="absolute right-2.5 top-2.5">
            <Badge tone="neutral" className="bg-surface/90 backdrop-blur-sm">
              <Layers className="mr-1 h-2.5 w-2.5" /> {tiers.length} tiers
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {item.category && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-signal-500">
            {titleize(item.category)}
          </p>
        )}

        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink-950 group-hover:text-signal-600">
          {item.title}
        </h3>

        {storeName && <p className="mt-1 text-xs text-ink-700/75">by {storeName}</p>}

        <div className="mt-2 flex items-center gap-3">
          <Rating rating={item.rating} numReviews={item.numReviews} />
          {item.totalOrders > 0 && (
            <span className="text-xs text-ink-700/75">{compact(item.totalOrders)} orders</span>
          )}
        </div>

        {tiers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tiers.map((t) => (
              <span
                key={t.name}
                className="rounded border border-line px-1.5 py-0.5 text-[10px] font-medium capitalize text-ink-700/75"
              >
                {t.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-ink-700/70">Starting at</p>
            <span className="font-display text-lg font-semibold text-ink-950">
              {money(entry?.price)}
            </span>
          </div>
          {entry?.deliveryDays && (
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-700/75">
              <Clock className="h-3 w-3" />
              {entry.deliveryDays}d delivery
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
