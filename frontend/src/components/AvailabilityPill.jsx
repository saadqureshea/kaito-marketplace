const LABELS = {
  full_time: { label: "Available full-time", tone: "ok" },
  part_time: { label: "Available part-time", tone: "ok" },
  contract: { label: "Open to contract", tone: "signal" },
  unavailable: { label: "Not taking work", tone: "muted" },
};

const TONES = {
  ok: "status-ok ring-green-600/20 dark:ring-green-400/25",
  signal: "bg-signal-500/10 text-signal-600 ring-signal-500/20",
  muted: "bg-paper-100 text-ink-700/75 ring-line",
};

export default function AvailabilityPill({ value, className = "" }) {
  const entry = LABELS[value];
  if (!entry) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${TONES[entry.tone]} ${className}`}
    >
      {entry.label}
    </span>
  );
}
