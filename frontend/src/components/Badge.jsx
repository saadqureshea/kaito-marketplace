const TONES = {
  gold: "bg-kaito-gold/15 text-[#8A6220] ring-kaito-gold/30",
  signal: "bg-signal-500/10 text-signal-600 ring-signal-500/20",
  neutral: "bg-ink-950/5 text-ink-700 ring-ink-950/10",
  green: "bg-green-50 text-green-700 ring-green-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-600 ring-red-600/20",
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
