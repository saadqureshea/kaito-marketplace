import { ChevronLeft, ChevronRight } from "lucide-react";

// Compact window around the current page so long result sets don't produce a
// hundred buttons: 1 ... 4 5 6 ... 20
function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const withGaps = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withGaps.push("gap");
    withGaps.push(p);
  });
  return withGaps;
}

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;

  const go = (p) => {
    onChange(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="press flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-700/75 transition hover:border-signal-500 hover:text-signal-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-700/75"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageWindow(page, pages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-xs text-ink-700/50">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === page ? "page" : undefined}
            className={`press flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-2 text-sm font-medium transition ${
              p === page
                ? "bg-signal-500 text-white"
                : "border border-line text-ink-700/85 hover:border-signal-500 hover:text-signal-500"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => go(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
        className="press flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-700/75 transition hover:border-signal-500 hover:text-signal-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-700/75"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
