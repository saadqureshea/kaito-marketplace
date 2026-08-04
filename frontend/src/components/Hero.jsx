import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";

const STATS = [
  { label: "seller keeps", value: "80%" },
  { label: "marketplace fee", value: "15%" },
  { label: "processing allowance", value: "5%" },
];

export default function Hero() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="relative overflow-hidden bg-ink-950">
      {/* subtle signature grid, evokes a manifest / shipping-ledger feel that
          ties the four marketplace sections (goods + services + work) together */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <p className="mb-4 inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-kaito-gold">
          One platform, four ways to earn
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
          Sell digital goods, custom orders, services — or hire remote talent.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
          KAITO MarketPlace connects buyers and sellers around the world. List once,
          get discovered, get paid — with transparent commission on every sale.
        </p>

        <form onSubmit={submit} className="mt-8 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-700/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try 'logo design', 'React developer', 'custom hoodie'..."
              className="w-full rounded-full border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-ink-900 shadow-card focus:outline-none focus:ring-2 focus:ring-signal-400"
            />
          </div>
          <button type="submit" className="btn-primary !px-6">
            Search <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </form>

        <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="text-xs uppercase tracking-wide text-white/50">{s.label}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
