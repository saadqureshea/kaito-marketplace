import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, AlertTriangle, Download } from "lucide-react";
import api from "../../api/axios.js";
import ReviewForm from "../../components/ReviewForm.jsx";
import EscrowStatus from "../../components/EscrowStatus.jsx";
import { money, titleize } from "../../utils/format.js";
import { assetUrl } from "../../utils/url.js";

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const [reviewedOrderIds, setReviewedOrderIds] = useState(new Set());
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [disputingId, setDisputingId] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/orders/mine").then(({ data }) => setOrders(data));
    api
      .get("/reviews/mine")
      .then(({ data }) => setReviewedOrderIds(new Set(data.map((r) => r.order))))
      .catch(() => {});
  };

  useEffect(load, []);

  const patchOrder = (updated) =>
    setOrders((prev) =>
      prev.map((o) =>
        o._id === updated._id
          ? {
              ...o,
              orderStatus: updated.orderStatus,
              paymentStatus: updated.paymentStatus,
              escrowStatus: updated.escrowStatus,
              payoutReleased: updated.payoutReleased,
              disputeReason: updated.disputeReason,
            }
          : o
      )
    );

  const confirmReceipt = async (id) => {
    setBusyId(id);
    setError("");
    try {
      const { data } = await api.put(`/orders/${id}/confirm`);
      patchOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not confirm this order");
    } finally {
      setBusyId(null);
    }
  };

  const raiseDispute = async (id) => {
    setBusyId(id);
    setError("");
    try {
      const { data } = await api.put(`/orders/${id}/dispute`, { reason: disputeReason });
      patchOrder(data);
      setDisputingId(null);
      setDisputeReason("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not raise the dispute");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold">My Orders</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="card divide-y divide-line">
        {orders.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-ink-700/75">No orders yet.</p>
            <Link to="/digital-products" className="btn-primary mt-4">
              Browse the marketplace
            </Link>
          </div>
        ) : (
          orders.map((o) => {
            const paid = o.paymentStatus === "paid";
            const disputed = o.orderStatus === "disputed";
            const canConfirm = paid && !o.payoutReleased && !disputed && o.orderStatus !== "completed";
            const canDispute = paid && !o.payoutReleased && !disputed;

            return (
              <div key={o._id} className="p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-950">
                      {o.product?.title || o.service?.title}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-700/75">
                      {titleize(o.orderStatus)}
                      {o.seller?.name && ` · ${o.seller.sellerProfile?.storeName || o.seller.name}`}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold">{money(o.totalCharged)}</span>
                </div>

                {paid && (
                  <div className="mt-3">
                    <EscrowStatus order={o} />
                  </div>
                )}

                {o.trackingNumber && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-700/75">
                    <Truck className="h-3.5 w-3.5" />
                    Tracking: <span className="font-medium text-ink-950">{o.trackingNumber}</span>
                  </p>
                )}

                {o.downloadUrl && (
                  <a
                    href={assetUrl(o.downloadUrl)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-signal-500 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download your file
                  </a>
                )}

                {disputed && o.disputeReason && (
                  <p className="mt-2 rounded-lg bg-paper-100 px-3 py-2 text-xs text-ink-700/85">
                    <span className="font-medium">Your report:</span> {o.disputeReason}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {canConfirm && (
                    <button
                      onClick={() => confirmReceipt(o._id)}
                      disabled={busyId === o._id}
                      className="press btn-primary !px-4 !py-1.5 text-xs"
                    >
                      <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                      {busyId === o._id ? "Confirming..." : "Confirm receipt & release payment"}
                    </button>
                  )}
                  {canDispute && disputingId !== o._id && (
                    <button
                      onClick={() => {
                        setDisputingId(o._id);
                        setDisputeReason("");
                      }}
                      className="press inline-flex items-center gap-1.5 text-xs font-medium text-ink-700/75 hover:text-red-600 dark:hover:text-red-300"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Report a problem
                    </button>
                  )}
                </div>

                {disputingId === o._id && (
                  <div className="mt-3 rounded-lg border border-line p-3">
                    <label className="mb-1 block text-xs font-medium">What went wrong?</label>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Describe the problem — our team reviews every dispute while your payment stays held."
                      className="input min-h-[70px] text-xs"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => raiseDispute(o._id)}
                        disabled={busyId === o._id || disputeReason.trim().length < 10}
                        className="press btn-primary !px-4 !py-1.5 text-xs"
                      >
                        {busyId === o._id ? "Submitting..." : "Submit dispute"}
                      </button>
                      <button
                        onClick={() => setDisputingId(null)}
                        className="press btn-secondary !px-4 !py-1.5 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {o.orderStatus === "completed" && (
                  <div className="mt-3">
                    {reviewedOrderIds.has(o._id) ? (
                      <span className="text-xs text-ink-700/75">You reviewed this order.</span>
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
                        className="press text-xs font-medium text-signal-500 hover:underline"
                      >
                        Leave a review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
