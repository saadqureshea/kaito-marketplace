import { Link } from "react-router-dom";

const STEPS = [
  {
    n: "01",
    title: "Create your account",
    body: "Join as a buyer, seller, worker, or employer. Sellers and workers submit a profile for review so buyers know who they're dealing with.",
  },
  {
    n: "02",
    title: "Get approved, then publish",
    body: "Listings and job posts start in review. Once an admin approves them they appear in the public marketplace — nothing goes live unchecked.",
  },
  {
    n: "03",
    title: "Sell, deliver, get paid",
    body: "Buyers pay securely at checkout. The 15% + 5% commission is calculated up front, and the remaining 80% is released to the seller on completion.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-t border-line bg-paper-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-signal-500">How it works</p>
        <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
          Built around review, not just listings
        </h2>
        <p className="mt-2 max-w-2xl text-ink-700/70">
          Four roles, one account, and an approval step that keeps the marketplace credible.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card relative p-6">
              <span className="font-display text-3xl font-semibold text-signal-500/25">{s.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-ink-950">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700/70">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register?role=seller" className="btn-primary">
            Start selling
          </Link>
          <Link to="/register?role=worker" className="btn-secondary">
            Create a worker profile
          </Link>
        </div>
      </div>
    </section>
  );
}
