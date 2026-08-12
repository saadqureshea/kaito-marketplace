import { ShieldCheck, Lock, RotateCcw, AlertTriangle } from "lucide-react";
import { money } from "../utils/format.js";

/**
 * Explains, in the buyer's terms, where their money currently is. The hold
 * already existed in the data - this is what makes it legible.
 */
export default function EscrowStatus({ order, compact = false }) {
  const disputed = order.orderStatus === "disputed";

  let tone, Icon, label, detail;

  if (disputed) {
    tone = "amber";
    Icon = AlertTriangle;
    label = "Under review";
    detail = "Your payment stays held while our team reviews this dispute.";
  } else if (order.escrowStatus === "refunded" || order.paymentStatus === "refunded") {
    tone = "red";
    Icon = RotateCcw;
    label = "Refunded";
    detail = "This order was cancelled and the payment returned.";
  } else if (order.payoutReleased || order.escrowStatus === "released") {
    tone = "green";
    Icon = ShieldCheck;
    label = "Released to seller";
    detail = `${money(order.sellerPayout)} was paid out after you confirmed receipt.`;
  } else if (order.paymentStatus === "paid") {
    tone = "signal";
    Icon = Lock;
    label = "Held in escrow";
    detail = `${money(order.sellerPayout)} is held until you confirm you've received this.`;
  } else {
    return null;
  }

  const tones = {
    signal: "bg-signal-500/10 text-signal-600 ring-signal-500/20",
    green: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
    red: "bg-red-50 text-red-600 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300",
  };

  if (compact) {
    return (
      <span
        title={detail}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tones[tone]}`}
      >
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  }

  return (
    <div className={`flex items-start gap-2.5 rounded-lg px-3 py-2 ring-1 ring-inset ${tones[tone]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold">{label}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{detail}</p>
      </div>
    </div>
  );
}
