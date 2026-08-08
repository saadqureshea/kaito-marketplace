const TONES = {
  gold: "bg-kaito-gold/15 text-[#8A6220] ring-kaito-gold/30 dark:text-kaito-gold",
  signal: "bg-signal-500/10 text-signal-600 ring-signal-500/20",
  neutral: "bg-ink-950/5 text-ink-700 ring-ink-950/10 dark:bg-ink-950/10",
  green: "status-ok ring-green-600/20 dark:ring-green-400/25",
  amber: "status-warn ring-amber-600/20 dark:ring-amber-400/25",
  red: "status-bad ring-red-600/20 dark:ring-red-400/25",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
