import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import FileUpload from "../../components/FileUpload.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const emptyProduct = {
  title: "",
  description: "",
  listingType: "digital",
  category: "",
  tags: "",
  price: "",
  images: [],
  fileUrl: [],
  leadTimeDays: "",
  manufacturer: "",
  customizationOptions: "",
};

const ORDER_STATUS_OPTIONS = ["in_production", "in_progress", "delivered", "completed", "cancelled", "disputed"];

const emptyService = {
  title: "",
  description: "",
  category: "web_app_dev",
  tags: "",
  images: [],
  basicPrice: "",
  basicDeliveryDays: "",
  basicRevisions: "1",
};

export default function SellerDashboard() {
  const { user, refresh } = useAuth();
  const [data, setData] = useState({ orders: [], totals: { grossRevenue: 0, totalCommissionPaid: 0, netPayout: 0 } });
  const [listings, setListings] = useState([]);
  const [services, setServices] = useState([]);
  const [listingKind, setListingKind] = useState("product");
  const [productForm, setProductForm] = useState(emptyProduct);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sellerProfile, setSellerProfile] = useState(user?.sellerProfile || {});
  const [savingProfile, setSavingProfile] = useState(false);

  const load = () => {
    api.get("/orders/sales").then(({ data }) => setData(data));
    api.get("/products/mine/list").then(({ data }) => setListings(data));
    api.get("/services/mine/list").then(({ data }) => setServices(data));
  };

  useEffect(load, []);

  const { totals } = data;

  const saveSellerProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put("/auth/profile", { sellerProfile });
      await refresh();
    } finally {
      setSavingProfile(false);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    // PUT /orders/:id/status returns the raw (unpopulated) order, so merge
    // just the fields it changed into the populated order already in state
    // rather than overwriting product/service/buyer with bare ObjectIds.
    const { data: updated } = await api.put(`/orders/${orderId}/status`, { orderStatus });
    setData((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o._id === orderId
          ? { ...o, orderStatus: updated.orderStatus, payoutReleased: updated.payoutReleased, payoutError: updated.payoutError }
          : o
      ),
    }));
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const payload = {
        title: productForm.title,
        description: productForm.description,
        listingType: productForm.listingType,
        category: productForm.category,
        tags: productForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        price: Number(productForm.price),
        images: productForm.images,
      };
      if (productForm.listingType === "digital") {
        payload.fileUrl = productForm.fileUrl[0] || "";
      } else {
        payload.productionDetails = {
          leadTimeDays: productForm.leadTimeDays ? Number(productForm.leadTimeDays) : undefined,
          manufacturer: productForm.manufacturer,
          customizationOptions: productForm.customizationOptions
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        };
      }
      await api.post("/products", payload);
      setProductForm(emptyProduct);
      setSuccess("Listing submitted for admin review.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create listing");
    } finally {
      setSubmitting(false);
    }
  };

  const submitService = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const payload = {
        title: serviceForm.title,
        description: serviceForm.description,
        category: serviceForm.category,
        tags: serviceForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: serviceForm.images,
        packages: [
          {
            name: "basic",
            title: `${serviceForm.title || "Basic"} package`,
            description: serviceForm.description,
            price: Number(serviceForm.basicPrice),
            deliveryDays: Number(serviceForm.basicDeliveryDays),
            revisions: Number(serviceForm.basicRevisions),
          },
        ],
      };
      await api.post("/services", payload);
      setServiceForm(emptyService);
      setSuccess("Service submitted for admin review.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold">Seller Dashboard</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <Stat label="Gross revenue" value={totals.grossRevenue} />
        <Stat label="Commission paid (20%)" value={totals.totalCommissionPaid} />
        <Stat label="Net payout (80%)" value={totals.netPayout} highlight />
      </div>

      <div className="mb-10 card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Store settings</h2>
        <form onSubmit={saveSellerProfile} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="input"
            placeholder="Store name"
            value={sellerProfile.storeName || ""}
            onChange={(e) => setSellerProfile({ ...sellerProfile, storeName: e.target.value })}
          />
          <input
            type="email"
            className="input"
            placeholder="PayPal payout email"
            value={sellerProfile.payoutEmail || ""}
            onChange={(e) => setSellerProfile({ ...sellerProfile, payoutEmail: e.target.value })}
          />
          <textarea
            className="input sm:col-span-2"
            placeholder="Store description"
            value={sellerProfile.storeDescription || ""}
            onChange={(e) => setSellerProfile({ ...sellerProfile, storeDescription: e.target.value })}
          />
          <button disabled={savingProfile} className="btn-secondary w-fit !px-4 !py-2 text-xs sm:col-span-2">
            {savingProfile ? "Saving..." : "Save store settings"}
          </button>
        </form>
        <p className="mt-2 text-xs text-ink-700/50">
          Your payout email receives the 80% seller share automatically once an order is marked completed.
        </p>
      </div>

      <div className="mb-10 card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Create a listing</h2>
          <div className="flex rounded-lg border border-line p-1 text-xs font-medium">
            <button
              onClick={() => setListingKind("product")}
              className={`rounded-md px-3 py-1.5 ${listingKind === "product" ? "bg-signal-500 text-white" : "text-ink-700/60"}`}
            >
              Product
            </button>
            <button
              onClick={() => setListingKind("service")}
              className={`rounded-md px-3 py-1.5 ${listingKind === "service" ? "bg-signal-500 text-white" : "text-ink-700/60"}`}
            >
              Service
            </button>
          </div>
        </div>

        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

        {listingKind === "product" ? (
          <form onSubmit={submitProduct} className="flex flex-col gap-3">
            <input
              required
              className="input"
              placeholder="Title"
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
            />
            <textarea
              required
              className="input min-h-[90px]"
              placeholder="Description"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="input"
                value={productForm.listingType}
                onChange={(e) => setProductForm({ ...productForm, listingType: e.target.value })}
              >
                <option value="digital">Digital Product</option>
                <option value="made_to_order">Made-to-Order</option>
              </select>
              <input
                required
                className="input"
                placeholder="Category (e.g. Templates)"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="input"
                placeholder="Price (USD)"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              />
              <input
                className="input"
                placeholder="Tags, comma separated"
                value={productForm.tags}
                onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Images</label>
              <FileUpload
                value={productForm.images}
                onChange={(images) => setProductForm({ ...productForm, images })}
                label="Upload images"
              />
            </div>

            {productForm.listingType === "digital" ? (
              <div>
                <label className="mb-1 block text-sm font-medium">Digital file (revealed to buyer after purchase)</label>
                <FileUpload
                  value={productForm.fileUrl}
                  onChange={(fileUrl) => setProductForm({ ...productForm, fileUrl })}
                  multiple={false}
                  accept="application/pdf,application/zip,application/epub+zip,image/*"
                  label="Upload file"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="Lead time (days)"
                  value={productForm.leadTimeDays}
                  onChange={(e) => setProductForm({ ...productForm, leadTimeDays: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Manufacturer"
                  value={productForm.manufacturer}
                  onChange={(e) => setProductForm({ ...productForm, manufacturer: e.target.value })}
                />
                <input
                  className="input col-span-2"
                  placeholder="Customization options, comma separated (e.g. Size, Color)"
                  value={productForm.customizationOptions}
                  onChange={(e) => setProductForm({ ...productForm, customizationOptions: e.target.value })}
                />
              </div>
            )}

            <button disabled={submitting} className="btn-primary mt-2 w-fit">
              {submitting ? "Submitting..." : "Submit for review"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitService} className="flex flex-col gap-3">
            <input
              required
              className="input"
              placeholder="Title"
              value={serviceForm.title}
              onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
            />
            <textarea
              required
              className="input min-h-[90px]"
              placeholder="Description"
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="input"
                value={serviceForm.category}
                onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
              >
                <option value="web_app_dev">Web/App Dev</option>
                <option value="ui_ux_design">UI/UX Design</option>
                <option value="video_editing">Video Editing</option>
                <option value="writing">Writing</option>
                <option value="ai_automation">AI Automation</option>
                <option value="other">Other</option>
              </select>
              <input
                className="input"
                placeholder="Tags, comma separated"
                value={serviceForm.tags}
                onChange={(e) => setServiceForm({ ...serviceForm, tags: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Images</label>
              <FileUpload
                value={serviceForm.images}
                onChange={(images) => setServiceForm({ ...serviceForm, images })}
                label="Upload images"
              />
            </div>

            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-ink-700/50">Basic package</p>
            <div className="grid grid-cols-3 gap-3">
              <input
                required
                type="number"
                min="5"
                step="0.01"
                className="input"
                placeholder="Price (USD)"
                value={serviceForm.basicPrice}
                onChange={(e) => setServiceForm({ ...serviceForm, basicPrice: e.target.value })}
              />
              <input
                required
                type="number"
                min="1"
                className="input"
                placeholder="Delivery days"
                value={serviceForm.basicDeliveryDays}
                onChange={(e) => setServiceForm({ ...serviceForm, basicDeliveryDays: e.target.value })}
              />
              <input
                type="number"
                min="0"
                className="input"
                placeholder="Revisions"
                value={serviceForm.basicRevisions}
                onChange={(e) => setServiceForm({ ...serviceForm, basicRevisions: e.target.value })}
              />
            </div>
            <p className="text-xs text-ink-700/50">
              Standard/premium tiers can be added later by editing the listing directly in the database.
            </p>

            <button disabled={submitting} className="btn-primary mt-2 w-fit">
              {submitting ? "Submitting..." : "Submit for review"}
            </button>
          </form>
        )}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold">Recent orders</h2>
      <div className="mb-10 card divide-y divide-line">
        {data.orders.length === 0 ? (
          <p className="p-6 text-sm text-ink-700/60">No orders yet.</p>
        ) : (
          data.orders.map((o) => (
            <div key={o._id} className="flex flex-col gap-2 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{o.product?.title || o.service?.title}</p>
                <p className="text-ink-700/60">
                  {o.buyer?.name} · payout ${o.sellerPayout?.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {o.paymentStatus === "paid" && ORDER_STATUS_OPTIONS.includes(o.orderStatus) && (
                  <select
                    className="input !w-auto !py-1.5 text-xs"
                    value={o.orderStatus}
                    onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                  >
                    {ORDER_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                )}
                <PayoutBadge order={o} />
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold">Your products</h2>
      <div className="mb-8 card divide-y divide-line">
        {listings.length === 0 ? (
          <p className="p-6 text-sm text-ink-700/60">No product listings yet.</p>
        ) : (
          listings.map((p) => <ListingRow key={p._id} item={p} />)
        )}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold">Your services</h2>
      <div className="card divide-y divide-line">
        {services.length === 0 ? (
          <p className="p-6 text-sm text-ink-700/60">No service listings yet.</p>
        ) : (
          services.map((s) => <ListingRow key={s._id} item={s} />)
        )}
      </div>
    </div>
  );
}

function PayoutBadge({ order }) {
  if (order.payoutReleased) {
    return <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">Paid out</span>;
  }
  if (order.payoutError) {
    return (
      <span
        title={order.payoutError}
        className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600"
      >
        Payout failed
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
      {order.orderStatus === "completed" ? "Payout pending" : "Awaiting completion"}
    </span>
  );
}

function ListingRow({ item }) {
  return (
    <div className="flex items-center justify-between p-4 text-sm">
      <span>{item.title}</span>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          item.status === "approved"
            ? "bg-green-50 text-green-700"
            : item.status === "rejected"
            ? "bg-red-50 text-red-600"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {item.status.replace("_", " ")}
      </span>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`card p-5 ${highlight ? "border-signal-500" : ""}`}>
      <p className="text-xs uppercase tracking-wide text-ink-700/50">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">${value?.toFixed(2)}</p>
    </div>
  );
}
