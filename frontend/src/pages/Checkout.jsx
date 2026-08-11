import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";

/**
 * Checkout flow (Stripe test mode):
 * 1. Buyer clicks "Pay with card" - we call our backend to create the
 *    order (server computes price + 15/5/20/80 commission split - never
 *    trust the client) and a Stripe Checkout Session.
 * 2. Buyer is redirected to Stripe's hosted checkout page.
 * 3. Stripe redirects back to /checkout/success, which confirms payment.
 */
export default function Checkout() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("idle"); // idle | processing | error
  const [error, setError] = useState("");

  const itemType = params.get("itemType"); // "product" | "service"
  const itemId = params.get("itemId");
  const servicePackage = params.get("package") || undefined;
  const quantity = Number(params.get("qty") || 1);

  const startCheckout = async () => {
    setStatus("processing");
    setError("");
    try {
      const { data } = await api.post("/payments/create-checkout-session", {
        itemType,
        itemId,
        servicePackage,
        quantity,
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.message || "Could not start checkout");
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-1 font-display text-2xl font-semibold">Checkout</h1>
      <p className="mb-8 text-sm text-ink-700/75">Secure payment via Stripe (test mode).</p>

      <div className="card p-6">
        {error && <p className="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}

        <button onClick={startCheckout} disabled={status === "processing"} className="btn-primary w-full">
          {status === "processing" ? "Redirecting to Stripe..." : "Pay with card"}
        </button>

        <p className="mt-4 text-center text-xs text-ink-700/75">
          Test card: 4242 4242 4242 4242, any future expiry, any CVC.
        </p>
      </div>
    </div>
  );
}
