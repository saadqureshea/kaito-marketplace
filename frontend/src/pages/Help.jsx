import { Link } from "react-router-dom";

const TOPICS = [
  {
    category: "Buying",
    items: [
      {
        q: "How is my payment protected?",
        a: "Payment is captured at checkout and held in escrow, not released to the seller straight away. It only pays out once you confirm the order yourself.",
      },
      {
        q: "What if what I received doesn't match the listing?",
        a: "Raise a dispute from your buyer dashboard before confirming the order. An admin reviews it and can refund you, release the seller's payout, or cancel the order.",
      },
      {
        q: "Can I buy more than one item at a time?",
        a: "Yes - add products and services to your cart and check out together. Made-to-order items and services still ship as separate orders per seller.",
      },
    ],
  },
  {
    category: "Selling",
    items: [
      {
        q: "How do I get verified as a seller?",
        a: "An admin reviews seller and freelancer profiles and marks eligible ones as verified. The badge appears automatically on your storefront and listings once approved.",
      },
      {
        q: "Why is my listing still pending?",
        a: "New and edited listings go through admin review before they appear in the public marketplace. This usually clears quickly, and you'll see the status change on your seller dashboard.",
      },
      {
        q: "When does a sale actually pay out?",
        a: "As soon as the buyer confirms the order as received or complete. See Fees & Commission for the full breakdown of what's deducted.",
      },
    ],
  },
  {
    category: "Remote work",
    items: [
      {
        q: "Who can see my CV?",
        a: "Your CV is private by default. It's only accessible to you, admins, and an employer you've specifically applied to - it's never listed publicly or searchable.",
      },
      {
        q: "How do employer-worker messages work?",
        a: "Once you apply to a job, messaging opens between you and the employer directly on that application, so context stays attached to the role.",
      },
    ],
  },
];

export default function Help() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-signal-500">Help Center</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950 sm:text-4xl">
        Answers to what people ask most.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-700/80">
        Can't find what you need here? Reach out and a real person will follow up.
      </p>

      <div className="mt-10 space-y-10">
        {TOPICS.map(({ category, items }) => (
          <div key={category}>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink-950">{category}</h2>
            <div className="space-y-5">
              {items.map(({ q, a }) => (
                <div key={q} className="card p-4">
                  <p className="text-sm font-semibold text-ink-950">{q}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-700/75">{a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
        <Link to="/contact" className="btn-primary">
          Contact us
        </Link>
        <Link to="/pricing" className="btn-secondary">
          Fees &amp; commission
        </Link>
      </div>
    </div>
  );
}
