import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Wallet, BadgeCheck } from "lucide-react";

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Nothing goes live unchecked",
    body: "Every listing, job post and professional profile is reviewed before it appears in the marketplace, so buyers know what they're browsing has already passed a check.",
  },
  {
    icon: Lock,
    title: "Payment is held, not just promised",
    body: "Checkout captures payment immediately, but it stays in escrow until the buyer confirms the order is complete. Sellers can mark work delivered; only the buyer releases the funds.",
  },
  {
    icon: Wallet,
    title: "No joining fee, no listing fee",
    body: "Selling or hiring on KAITO costs nothing until something actually sells. Commission is calculated up front and shown before checkout - sellers keep 80% of every sale.",
  },
  {
    icon: BadgeCheck,
    title: "One account, four ways to trade",
    body: "Buy digital products and made-to-order goods, hire specialists for fixed-scope services, or find and post remote work - all from a single profile.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-signal-500">About KAITO</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950 sm:text-4xl">
        A marketplace built around review, not just listings.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-700/80">
        KAITO MarketPlace brings digital products, made-to-order goods, professional services and
        remote work together in one place. Instead of optimising for the largest possible catalogue,
        the platform is built around a small set of trust mechanisms - admin review, escrow, and
        verified profiles - that apply the same way whether you're buying a template, commissioning
        a handmade piece, hiring a freelancer, or posting a job.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {PRINCIPLES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-500/10 text-signal-500">
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="mt-3 font-display text-base font-semibold text-ink-950">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-700/75">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
        <Link to="/register?role=seller" className="btn-primary">
          Start selling
        </Link>
        <Link to="/pricing" className="btn-secondary">
          See fees &amp; commission
        </Link>
      </div>
    </div>
  );
}
