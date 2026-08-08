import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({ eyebrow, title, subtitle, to, linkLabel = "View all" }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-signal-500">{eyebrow}</p>
        )}
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-700/65">{subtitle}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className="group inline-flex items-center gap-1 text-sm font-medium text-signal-500 hover:text-signal-600"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
