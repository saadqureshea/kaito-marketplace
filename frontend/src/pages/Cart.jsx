import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, Minus, Plus, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { assetUrl } from "../utils/url.js";
import { money } from "../utils/format.js";

const MARKETPLACE_RATE = 0.15;
const PROCESSING_RATE = 0.05;

export default function Cart() {
  const { lines, count, subtotal, remove, setQuantity, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Shown for transparency only. The server recomputes all of this from the
  // stored listing prices when the session is created.
  const marketplaceFee = Math.round(subtotal * MARKETPLACE_RATE * 100) / 100;
  const processingFee = Math.round(subtotal * PROCESSING_RATE * 100) / 100;
  const sellerPayout = Math.round((subtotal - marketplaceFee - processingFee) * 100) / 100;

  const goToCheckout = () => {
    if (!user) return navigate("/login?next=/checkout");
    navigate("/checkout");
  };

  if (count === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper-100 text-ink-700/50">
          <ShoppingCart className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-700/75">
          Browse the marketplace and add products or service packages to get started.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/digital-products" className="btn-primary">
            Browse products
          </Link>
          <Link to="/services" className="btn-secondary">
            Browse services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Your cart</h1>
          <p className="mt-1 text-sm text-ink-700/75">
            {count} item{count === 1 ? "" : "s"}
          </p>
        </div>
        <button onClick={clear} className="text-sm text-ink-700/75 hover:text-red-600 dark:hover:text-red-300">
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Lines */}
        <ul className="card divide-y divide-line">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-4 p-4">
              <Link
                to={l.itemType === "service" ? `/services/${l.itemId}` : `/products/${l.itemId}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-paper-100"
              >
                {l.image ? (
                  <img src={assetUrl(l.image)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] text-ink-700/40">
                    No image
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  to={l.itemType === "service" ? `/services/${l.itemId}` : `/products/${l.itemId}`}
                  className="line-clamp-2 text-sm font-medium text-ink-950 hover:text-signal-500"
                >
                  {l.title}
                </Link>
                {l.sellerName && <p className="mt-0.5 text-xs text-ink-700/75">by {l.sellerName}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      onClick={() => setQuantity(l.key, l.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="press flex h-7 w-7 items-center justify-center rounded-full text-ink-700/75 hover:text-signal-500"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[1.75rem] text-center text-xs font-medium">{l.quantity}</span>
                    <button
                      onClick={() => setQuantity(l.key, l.quantity + 1)}
                      aria-label="Increase quantity"
                      className="press flex h-7 w-7 items-center justify-center rounded-full text-ink-700/75 hover:text-signal-500"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => remove(l.key)}
                    className="press inline-flex items-center gap-1 text-xs text-ink-700/75 hover:text-red-600 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-display text-base font-semibold text-ink-950">
                  {money((Number(l.price) || 0) * l.quantity)}
                </p>
                {l.quantity > 1 && (
                  <p className="mt-0.5 text-[11px] text-ink-700/75">{money(l.price)} each</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-700/75">Subtotal</dt>
              <dd className="font-medium">{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-700/75">
              <dt>Marketplace fee (15%)</dt>
              <dd>{money(marketplaceFee)}</dd>
            </div>
            <div className="flex justify-between text-ink-700/75">
              <dt>Payment processing (5%)</dt>
              <dd>{money(processingFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink-950">
              <dt>You pay</dt>
              <dd>{money(subtotal)}</dd>
            </div>
          </dl>

          <p className="mt-3 text-xs leading-relaxed text-ink-700/75">
            Commission comes out of the sale, not on top of it — sellers receive{" "}
            <span className="font-medium text-ink-950">{money(sellerPayout)}</span> (80%).
          </p>

          <button onClick={goToCheckout} className="press btn-primary mt-5 w-full">
            {user ? "Continue to checkout" : "Sign in to checkout"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>

          <Link
            to="/digital-products"
            className="mt-3 block text-center text-xs font-medium text-signal-500 hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
