import { Link } from "react-router-dom";

const FAQS = [
  {
    q: "Is there a fee to join or create an account?",
    a: "No. Creating a buyer, seller, worker or employer account is free, and staying on the platform costs nothing.",
  },
  {
    q: "Is there a fee to list a product, service or job?",
    a: "No. You can publish as many products, service packages and job posts as you like - listing itself is never charged.",
  },
  {
    q: "When is commission actually charged?",
    a: "Only when an order is placed and paid for. If nothing sells, nothing is charged.",
  },
  {
    q: "When do I get paid as a seller?",
    a: "Payment is captured at checkout and held in escrow. It's released to you once the buyer confirms the order - not before, and not automatically on a timer.",
  },
  {
    q: "What if a buyer and seller disagree?",
    a: "Either side can raise a dispute before the buyer confirms. An admin reviews the order and resolves it - refunding the buyer, releasing the seller's payout, or cancelling the order.",
  },
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-signal-500">Fees &amp; Commission</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950 sm:text-4xl">
        One commission rate. Disclosed before checkout.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-700/80">
        There's no joining fee and no listing fee anywhere on KAITO. The only charge is a
        commission on completed sales, and it's the same rate across every product, service and
        made-to-order category.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl2 border border-line">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-line">
            <tr>
              <td className="p-4 text-ink-700/75">Marketplace commission</td>
              <td className="p-4 text-right font-semibold text-ink-950">15%</td>
            </tr>
            <tr>
              <td className="p-4 text-ink-700/75">Payment processing</td>
              <td className="p-4 text-right font-semibold text-ink-950">5%</td>
            </tr>
            <tr className="bg-paper-50">
              <td className="p-4 font-semibold text-ink-950">Total commission</td>
              <td className="p-4 text-right font-semibold text-ink-950">20%</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-signal-600">Seller keeps</td>
              <td className="p-4 text-right font-display text-lg font-semibold text-signal-600">80%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-700/70">
        Commission is calculated automatically at checkout and shown before the buyer pays - there's
        no separate invoice or deduction to track down later.
      </p>

      <div className="mt-12 border-t border-line pt-8">
        <h2 className="mb-5 font-display text-lg font-semibold text-ink-950">Common questions</h2>
        <div className="space-y-5">
          {FAQS.map(({ q, a }) => (
            <div key={q}>
              <p className="text-sm font-semibold text-ink-950">{q}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-700/75">{a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
        <Link to="/register?role=seller" className="btn-primary">
          Start selling
        </Link>
        <Link to="/help" className="btn-secondary">
          More help topics
        </Link>
      </div>
    </div>
  );
}
