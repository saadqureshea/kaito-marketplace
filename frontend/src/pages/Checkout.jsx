import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { money } from "../utils/format.js";

/**
 * Checkout flow (Stripe test mode):
 * 1. Collect the lines - either from the cart, or from query params when the
 *    buyer used "Buy now" on a detail page.
 * 2. Backend re-resolves every price, computes the 15/5/20/80 split and
 *    creates one Stripe session plus one Order per line.
 * 3. Stripe redirects to /checkout/success, which confirms the payment.
 */
export default function Checkout() {
  const [params] = useSearchParams();
  const { lines: cartLines, subtotal: cartSubtotal, clear } = useCart();
  const [status, setStatus] = useState("idle"); // idle | processing | error
  const [error, setError] = useState("");

  // Query params take priority so an existing "Buy now" link still checks out
  // just that item, leaving whatever is in the cart untouched.
  const directItemId = params.get("itemId");
  const direct = directItemId
    ? {
        itemType: params.get("itemType") || "product",
        itemId: directItemId,
        servicePackage: params.get("package") || undefined,
        quantity: Number(params.get("qty") || 1),
      }
    : null;

  const lines = direct ? [direct] : cartLines;
  const isEmpty = lines.length === 0;

  const startCheckout = async () => {
    setStatus("processing");
    setError("");
    try {
      const { data } = await api.post("/payments/create-checkout-session", {
        items: lines.map((l) => ({
          itemType: l.itemType,
          itemId: l.itemId,
          servicePackage: l.servicePackage,
          quantity: l.quantity,
        })),
      });
      // Only clear once Stripe has accepted the session, so a failed attempt
      // doesn't lose the buyer's cart.
      if (!direct) clear();
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.message || "Could not start checkout");
      setStatus("error");
    }
  };

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Nothing to check out</h1>
        <p className="mt-2 text-sm text-ink-700/75">Your cart is empty.</p>
        <Link to="/digital-products" className="btn-primary mt-6">
          Browse the marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-1 font-display text-2xl font-semibold">Checkout</h1>
      <p className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-700/75">
        <Lock className="h-3.5 w-3.5" />
        Secure payment via Stripe (test mode)
      </p>

      <div className="card p-6">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        {!direct && (
          <ul className="mb-5 space-y-2 border-b border-line pb-5 text-sm">
            {cartLines.map((l) => (
              <li key={l.key} className="flex justify-between gap-4">
                <span className="min-w-0 text-ink-700/85">
                  <span className="line-clamp-1">{l.title}</span>
                  {l.quantity > 1 && <span className="text-xs text-ink-700/70"> x{l.quantity}</span>}
                </span>
                <span className="shrink-0 font-medium">
                  {money((Number(l.price) || 0) * l.quantity)}
                </span>
              </li>
            ))}
            <li className="flex justify-between border-t border-line pt-2 font-semibold text-ink-950">
              <span>Total</span>
              <span>{money(cartSubtotal)}</span>
            </li>
          </ul>
        )}

        <button
          onClick={startCheckout}
          disabled={status === "processing"}
          className="press btn-primary w-full"
        >
          {status === "processing" ? "Redirecting to Stripe..." : "Pay with card"}
          {status !== "processing" && <ArrowRight className="ml-2 h-4 w-4" />}
        </button>

        <p className="mt-4 text-center text-xs text-ink-700/70">
          Test card: 4242 4242 4242 4242, any future expiry, any CVC.
        </p>
      </div>
    </div>
  );
}
