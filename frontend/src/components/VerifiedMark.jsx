import { BadgeCheck } from "lucide-react";

/**
 * Shown next to a seller or freelancer who has been verified by an admin.
 * Deliberately quiet at `sm` so it reads as a trust signal on a card rather
 * than decoration.
 */
export default function VerifiedMark({ size = "sm", withLabel = false, className = "" }) {
  const icon = size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5";

  if (!withLabel) {
    return (
      <BadgeCheck
        aria-label="Verified"
        title="Verified by KAITO"
        className={`inline-block shrink-0 text-signal-500 ${size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} ${className}`}
      />
    );
  }

  return (
    <span
      title="Verified by KAITO"
      className={`inline-flex items-center gap-1 rounded-full bg-signal-500/10 px-2 py-0.5 text-[11px] font-semibold text-signal-600 ring-1 ring-inset ring-signal-500/20 ${className}`}
    >
      <BadgeCheck className={icon} />
      Verified
    </span>
  );
}
