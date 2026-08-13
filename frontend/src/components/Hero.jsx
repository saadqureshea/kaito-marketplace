import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShieldCheck, Lock, BadgeCheck } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import RoleChooser from "./RoleChooser.jsx";

const QUICK_LINKS = [
  { to: "/digital-products", label: "Templates" },
  { to: "/made-to-order", label: "Handmade" },
  { to: "/services", label: "Design services" },
  { to: "/remote-work", label: "Remote jobs" },
];

const ASSURANCES = [
  { icon: ShieldCheck, label: "Admin-reviewed listings" },
  { icon: Lock, label: "Payment held until you confirm" },
  { icon: BadgeCheck, label: "No listing fees" },
];

function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] w-full animate-pulse bg-paper-100" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-paper-100" />
        <div className="h-4 w-full animate-pulse rounded bg-paper-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-paper-100" />
      </div>
    </div>
  );
}

/**
 * Product-led hero: the copy column states what KAITO is and which door to
 * walk through, while real listings sit alongside it so the marketplace is
 * visible before any scrolling. `products` comes from Home so the hero and
 * the grid below share one request.
 */
export default function Hero({ products }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const featured = (products || []).slice(0, 4);
  const loading = products === null;

  return (
    <section className="hero-surface border-b border-line">
      {/* DOM order is copy -> listings -> role choice, which is what phones
          get, so products sit just under the search box rather than below a
          screenful of text. On lg the listings column is repositioned to span
          both rows on the right, putting the role cards back under the copy. */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-14 lg:gap-y-8 lg:px-8 lg:py-16">
        {/* Copy + search */}
        <div className="lg:col-start-1 lg:row-start-1 lg:pt-4">
          <p className="inline-flex items-center rounded-full border border-signal-500/25 bg-signal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-signal-600">
            Digital goods · Custom orders · Services · Remote work
          </p>

          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink-950 sm:text-4xl lg:text-[2.75rem]">
            The marketplace for digital work and handmade goods.
          </h1>

          <p className="mt-4 max-w-xl text-base text-ink-700/75">
            Buy templates, code and custom-made pieces, hire specialists, or start selling
            your own. No joining fee and no listing fee — commission is only charged when
            something sells, and sellers keep 80%.
          </p>

          <form onSubmit={submit} className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search the marketplace"
                placeholder="Search products, services or jobs..."
                className="w-full rounded-full border border-line bg-surface py-3 pl-11 pr-4 text-sm text-ink-900 shadow-card placeholder:text-ink-700/40 focus:border-signal-500 focus:outline-none focus:ring-1 focus:ring-signal-500"
              />
            </div>
            <button type="submit" className="btn-primary shrink-0 !px-5">
              Search
            </button>
          </form>

          {/* Hidden on phones to keep the listings above the fold - the
              category tiles further down cover the same ground there. */}
          <div className="mt-3 hidden flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-ink-700/75 sm:flex">
            <span className="font-medium">Popular:</span>
            {QUICK_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-full border border-line px-2.5 py-1 transition hover:border-signal-500 hover:text-signal-500"
              >
                {label}
              </Link>
            ))}
          </div>

          <RoleChooser className="mt-6" />
        </div>

        {/* Live listings - grid on desktop, swipeable rail on mobile */}
        <div className="mt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-700/70">
              Live on the marketplace
            </h2>
            <Link to="/digital-products" className="text-xs font-medium text-signal-500 hover:underline">
              See all
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <p className="rounded-xl2 border border-dashed border-line bg-surface/60 p-10 text-center text-sm text-ink-700/75">
              Listings will appear here as sellers publish them.
            </p>
          ) : (
            /* One set of cards that reflows: a swipeable rail on phones,
               a 2x2 grid from sm up. */
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0">
              {featured.map((p) => (
                <div
                  key={p._id}
                  className="w-[58vw] max-w-[220px] shrink-0 snap-start sm:w-auto sm:max-w-none"
                >
                  <ProductCard item={p} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assurances */}
        <div className="mt-6 lg:col-start-1 lg:row-start-2 lg:mt-0">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {ASSURANCES.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5 text-xs text-ink-700/75">
                <Icon className="h-3.5 w-3.5 text-signal-500" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
