import { Link } from "react-router-dom";
import { FileCode2, Shirt, Sparkles, Briefcase } from "lucide-react";

const SECTIONS = [
  {
    to: "/digital-products",
    icon: FileCode2,
    title: "Digital Products",
    desc: "Templates, graphics, code, e-books — instant download.",
  },
  {
    to: "/made-to-order",
    icon: Shirt,
    title: "Made-to-Order",
    desc: "Custom clothing & handmade goods, tracked from maker to door.",
  },
  {
    to: "/services",
    icon: Sparkles,
    title: "Digital Services",
    desc: "Web/app dev, UI/UX, video editing, writing, AI automation.",
  },
  {
    to: "/remote-work",
    icon: Briefcase,
    title: "Remote Work",
    desc: "Free profiles, CV & portfolio uploads, jobs, applications.",
  },
];

export default function CategoryTabs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold sm:text-3xl">Four marketplaces, one account</h2>
      <p className="mt-2 max-w-2xl text-ink-700/70">
        Switch between buying, selling, and working — your dashboard adapts to what you're doing.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="card group flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-signal-500"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-signal-500/10 text-signal-500 transition group-hover:bg-signal-500 group-hover:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink-950">{title}</h3>
              <p className="mt-1 text-sm text-ink-700/70">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
