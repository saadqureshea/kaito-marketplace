import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("confirming"); // confirming | paid | error
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const sessionId = params.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("Missing checkout session.");
      return;
    }
    api
      .post("/payments/confirm-session", { sessionId })
      .then(({ data }) => {
        if (data.status === "paid" || data.status === "already_paid") {
          setStatus("paid");
          setOrder(data.order);
          setTimeout(() => navigate("/dashboard/buyer"), 2500);
        } else {
          setStatus("error");
          setError("Payment was not completed.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setError(err.response?.data?.message || "Could not confirm payment");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-1 font-display text-2xl font-semibold">Checkout</h1>

      <div className="card p-6">
        {status === "confirming" && <p className="text-sm text-ink-700/60">Confirming your payment...</p>}

        {status === "paid" && (
          <div>
            <p className="rounded-lg bg-green-50 dark:bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
              Payment successful! Redirecting to your orders...
            </p>
            {order && (
              <p className="mt-4 text-xs text-ink-700/50">
                Charged ${order.totalCharged?.toFixed(2)} - seller receives ${order.sellerPayout?.toFixed(2)} (80%)
                after commission.
              </p>
            )}
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>
            <Link to="/dashboard/buyer" className="mt-4 inline-block text-sm text-signal-500 hover:underline">
              Go to your orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
