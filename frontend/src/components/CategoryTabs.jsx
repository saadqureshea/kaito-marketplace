import { Link } from "react-router-dom";
import { FileCode2, Shirt, Sparkles, Briefcase, ArrowRight, Check } from "lucide-react";
import CategoryChips from "./CategoryChips.jsx";

// The bullets answer the question a visitor actually arrives with - "can I
// sell/buy my thing here?" - which a one-line summary leaves open.
const SECTIONS = [
  {
    n: "01",
    to: "/digital-products",
    icon: FileCode2,
    title: "Digital Products",
    desc: "Instant-download files, delivered securely after checkout.",
    items: [
      "Website, app and e-commerce templates",
      "Graphics, logos and branding kits",
      "CV, presentation and document templates",
      "E-books, courses and prompt packs",
      "Presets, motion graphics and media",
      "Source code, scripts and spreadsheets",
    ],
  },
  {
    n: "02",
    to: "/made-to-order",
    icon: Shirt,
    title: "Made-to-Order",
    desc: "Physical goods produced to each buyer's requirements.",
    items: [
      "Custom clothing and leather goods",
      "Jewellery and handmade crafts",
      "Personalised and printed gifts",
      "Artwork and home decoration",
      "Buyer-specified customisation options",
      "Seller-managed production and tracking",
    ],
  },
  {
    n: "03",
    to: "/services",
    icon: Sparkles,
    title: "Digital Services",
    desc: "Hire specialists on fixed-scope, tiered packages.",
    items: [
      "Website, app and software development",
      "Graphic design and UI/UX",
      "Video editing, animation and voice-over",
      "Content writing, SEO and social media",
      "E-commerce and product-listing support",
      "AI automation, chatbots and data work",
    ],
  },
  {
    n: "04",
    to: "/remote-work",
    icon: Briefcase,
    title: "Remote Work",
    desc: "Free professional profiles and international remote jobs.",
    items: [
      "Free professional profiles",
      "CV and portfolio uploads",
      "Skills, experience, rates and availability",
      "Remote job posting and applications",
      "Employer–worker messaging",
      "Application tracking and hiring status",
    ],
  },
];

export default function CategoryTabs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">Shop by category</h2>
      <p className="mb-6 mt-2 max-w-2xl text-ink-700/75">
        Browse what sellers are publishing right now.
      </p>
      <CategoryChips />

      <h2 className="mt-14 font-display text-2xl font-semibold sm:text-3xl">
        Four ways to trade on KAITO
      </h2>
      <p className="mt-2 max-w-2xl text-ink-700/75">
        One account covers buying, selling, hiring and working — with no joining fee and no
        listing fee. You're only charged commission when something actually sells.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map(({ n, to, icon: Icon, title, desc, items }) => (
          <Link
            key={to}
            to={to}
            className="card group flex flex-col p-6 transition duration-200 hover:-translate-y-1 hover:border-signal-500 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-signal-500/10 text-signal-500 transition group-hover:bg-signal-500 group-hover:text-on-brand">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-display text-2xl font-semibold text-signal-500/20">{n}</span>
            </div>

            <h3 className="mt-4 font-display text-lg font-semibold text-ink-950">{title}</h3>
            <p className="mt-1 text-sm text-ink-700/75">{desc}</p>

            <ul className="mt-4 space-y-1.5">
              {items.map((it) => (
                <li key={it} className="flex gap-2 text-xs leading-relaxed text-ink-700/75">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-signal-500" />
                  {it}
                </li>
              ))}
            </ul>

            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-signal-500">
              Explore
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
