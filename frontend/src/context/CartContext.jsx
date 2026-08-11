import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "kaito_cart";
const MAX_QTY = 99;

/**
 * Cart lives in localStorage rather than on the server so a visitor can fill
 * one before they have an account, and only sign in at checkout. Prices here
 * are for display only - the checkout endpoint re-resolves every line against
 * the database, so a tampered cart can't change what someone is charged.
 */

// A service is only the same line if the same package tier was chosen.
const lineKey = (item) =>
  item.itemType === "service" ? `service:${item.itemId}:${item.servicePackage}` : `product:${item.itemId}`;

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(readStored);
  // Bumped whenever something is added, so the navbar badge can animate.
  const [lastAddedAt, setLastAddedAt] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* quota or private mode - cart just won't persist */
    }
  }, [lines]);

  // Keep tabs in sync if the cart changes elsewhere.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setLines(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = (item, quantity = 1) => {
    const key = lineKey(item);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l
        );
      }
      return [...prev, { ...item, key, quantity: Math.min(MAX_QTY, quantity) }];
    });
    setLastAddedAt(Date.now());
  };

  const remove = (key) => setLines((prev) => prev.filter((l) => l.key !== key));

  const setQuantity = (key, quantity) => {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) return remove(key);
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, Math.floor(qty)) } : l))
    );
  };

  const clear = () => setLines([]);

  const has = (item) => lines.some((l) => l.key === lineKey(item));

  const value = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + (Number(l.price) || 0) * l.quantity, 0);
    return {
      lines,
      count,
      subtotal: Math.round(subtotal * 100) / 100,
      lastAddedAt,
      add,
      remove,
      setQuantity,
      clear,
      has,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, lastAddedAt]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
export { lineKey };
