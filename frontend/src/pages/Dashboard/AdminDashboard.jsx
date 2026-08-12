import { useEffect, useState } from "react";
import { AlertTriangle, Lock } from "lucide-react";
import api from "../../api/axios.js";
import { money, timeAgo } from "../../utils/format.js";

const RESOLUTIONS = [
  { value: "refunded", label: "Refund buyer", hint: "Cancels the order and marks the payment refunded." },
  { value: "released", label: "Release to seller", hint: "Rejects the dispute and pays the seller." },
  { value: "cancelled", label: "Cancel order", hint: "Voids the order without paying out." },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [note, setNote] = useState({});
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
    api.get("/admin/products/pending").then(({ data }) => setPendingProducts(data));
    api.get("/admin/disputes").then(({ data }) => setDisputes(data)).catch(() => setDisputes([]));
  };

  useEffect(load, []);

  const approve = async (id) => {
    await api.put(`/admin/products/${id}/approve`);
    load();
  };
  const reject = async (id) => {
    await api.put(`/admin/products/${id}/reject`, { reason: "Does not meet guidelines" });
    load();
  };

  const resolve = async (orderId, resolution) => {
    setBusy(orderId);
    setError("");
    try {
      await api.put(`/admin/orders/${orderId}/resolve`, { resolution, note: note[orderId] || "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not resolve this dispute");
    } finally {
      setBusy(null);
    }
  };

  if (!stats) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold">Admin Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Total users" value={stats.totalUsers} />
        <Stat
          label="Pending listings"
          value={stats.pendingProducts + stats.pendingServices + stats.pendingJobs}
        />
        <Stat label="Pending profiles" value={stats.pendingProfiles} />
        <Stat label="Held in escrow" value={money(stats.heldInEscrow || 0)} icon={Lock} />
        <Stat
          label="Open disputes"
          value={stats.openDisputes || 0}
          alert={(stats.openDisputes || 0) > 0}
          icon={AlertTriangle}
        />
      </div>

      {/* Disputes */}
      <h2 className="mb-3 font-display text-lg font-semibold">Disputes</h2>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="mb-8 card divide-y divide-line">
        {disputes.length === 0 ? (
          <p className="p-6 text-sm text-ink-700/75">No open disputes.</p>
        ) : (
          disputes.map((d) => (
            <div key={d._id} className="p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink-950">{d.product?.title || d.service?.title}</p>
                  <p className="mt-0.5 text-xs text-ink-700/75">
                    {d.buyer?.name} vs {d.seller?.sellerProfile?.storeName || d.seller?.name}
                    {d.disputeRaisedAt && ` · raised ${timeAgo(d.disputeRaisedAt)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold">{money(d.totalCharged)}</p>
                  <p className="text-[11px] text-ink-700/75">{money(d.sellerPayout)} held</p>
                </div>
              </div>

              <p className="mt-2 rounded-lg bg-paper-100 px-3 py-2 text-xs text-ink-700/85">
                <span className="font-medium">Buyer's report:</span> {d.disputeReason}
              </p>

              <input
                value={note[d._id] || ""}
                onChange={(e) => setNote({ ...note, [d._id]: e.target.value })}
                placeholder="Resolution note (optional)"
                className="input mt-2 text-xs"
              />

              <div className="mt-2 flex flex-wrap gap-2">
                {RESOLUTIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => resolve(d._id, r.value)}
                    disabled={busy === d._id}
                    title={r.hint}
                    className="press btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Listing approvals */}
      <h2 className="mb-3 font-display text-lg font-semibold">Pending product approvals</h2>
      <div className="card divide-y divide-line">
        {pendingProducts.length === 0 ? (
          <p className="p-6 text-sm text-ink-700/75">Nothing pending review.</p>
        ) : (
          pendingProducts.map((p) => (
            <div key={p._id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-ink-700/75">{p.seller?.name}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(p._id)} className="press btn-primary !px-3 !py-1.5 text-xs">
                  Approve
                </button>
                <button onClick={() => reject(p._id)} className="press btn-secondary !px-3 !py-1.5 text-xs">
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, alert, icon: Icon }) {
  return (
    <div className={`card p-5 ${alert ? "border-amber-500/40" : ""}`}>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-700/75">
        {Icon && (
          <Icon className={`h-3.5 w-3.5 ${alert ? "text-amber-600 dark:text-amber-300" : ""}`} />
        )}
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
