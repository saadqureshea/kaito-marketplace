import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import ReviewForm from "../../components/ReviewForm.jsx";

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const [reviewedOrderIds, setReviewedOrderIds] = useState(new Set());
  const [reviewingOrderId, setReviewingOrderId] = useState(null);

  const load = () => {
    api.get("/orders/mine").then(({ data }) => setOrders(data));
    api
      .get("/reviews/mine")
      .then(({ data }) => setReviewedOrderIds(new Set(data.map((r) => r.order))))
      .catch(() => {});
  };

  useEffect(load, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold">My Orders</h1>
      <div className="card divide-y divide-line">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-ink-700/60">No orders yet — browse the marketplace to get started.</p>
        ) : (
          orders.map((o) => (
            <div key={o._id} className="p-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{o.product?.title || o.service?.title}</p>
                  <p className="text-ink-700/60">{o.orderStatus.replace("_", " ")}</p>
                </div>
                <span className="font-semibold">${o.totalCharged?.toFixed(2)}</span>
              </div>

              {o.orderStatus === "completed" && (
                <div className="mt-2">
                  {reviewedOrderIds.has(o._id) ? (
                    <span className="text-xs text-ink-700/50">You reviewed this order.</span>
                  ) : reviewingOrderId === o._id ? (
                    <ReviewForm
                      orderId={o._id}
                      onSubmitted={() => {
                        setReviewingOrderId(null);
                        load();
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setReviewingOrderId(o._id)}
                      className="text-xs font-medium text-signal-500 hover:underline"
                    >
                      Leave a review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
