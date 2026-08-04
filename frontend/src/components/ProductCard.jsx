import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function ProductCard({ item, type = "product" }) {
  const price = type === "service" ? item.packages?.[0]?.price : item.price;
  const link = type === "service" ? `/services/${item._id}` : `/products/${item._id}`;

  return (
    <Link to={link} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:border-signal-500">
      <div className="aspect-[4/3] w-full overflow-hidden bg-paper-100">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-700/30">No image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-medium text-ink-950">{item.title}</h3>
        <p className="mt-1 text-xs text-ink-700/60">{item.seller?.name || item.seller?.sellerProfile?.storeName}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display font-semibold text-ink-950">
            {type === "service" ? "From " : ""}${price?.toFixed(2)}
          </span>
          {item.rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-ink-700/70">
              <Star className="h-3.5 w-3.5 fill-kaito-gold text-kaito-gold" /> {item.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
