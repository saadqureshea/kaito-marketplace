import { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingProducts, setPendingProducts] = useState([]);

  const load = () => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
    api.get("/admin/products/pending").then(({ data }) => setPendingProducts(data));
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

  if (!stats) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold">Admin Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total users" value={stats.totalUsers} />
        <Stat label="Pending listings" value={stats.pendingProducts + stats.pendingServices + stats.pendingJobs} />
        <Stat label="Pending profiles" value={stats.pendingProfiles} />
        <Stat label="Net platform revenue" value={`$${(stats.revenue.marketplaceFee + stats.revenue.paymentProcessingFee).toFixed(2)}`} />
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold">Pending product approvals</h2>
      <div className="card divide-y divide-line">
        {pendingProducts.length === 0 ? (
          <p className="p-6 text-sm text-ink-700/60">Nothing pending review.</p>
        ) : (
          pendingProducts.map((p) => (
            <div key={p._id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-ink-700/60">{p.seller?.name}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(p._id)} className="btn-primary !px-3 !py-1.5 text-xs">Approve</button>
                <button onClick={() => reject(p._id)} className="btn-secondary !px-3 !py-1.5 text-xs">Reject</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-ink-700/50">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
