import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "./AuthContext.jsx";

const FavouritesContext = createContext(null);

const keyOf = (itemType, itemId) => `${itemType}:${itemId}`;

/**
 * Holds just the set of saved keys so every card can render its heart without
 * each one making a request. The full items are fetched separately by the
 * favourites page.
 */
export function FavouritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/favourites/ids");
      setIds(new Set(data));
    } catch {
      setIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavourite = useCallback((itemType, itemId) => ids.has(keyOf(itemType, itemId)), [ids]);

  const toggle = useCallback(
    async (itemType, itemId) => {
      if (!user) return { needsAuth: true };
      const key = keyOf(itemType, itemId);
      const wasSaved = ids.has(key);

      // Optimistic: the heart should respond immediately, and a failed
      // request rolls it back rather than leaving a lie on screen.
      setIds((prev) => {
        const next = new Set(prev);
        wasSaved ? next.delete(key) : next.add(key);
        return next;
      });

      try {
        if (wasSaved) await api.delete(`/favourites/${itemType}/${itemId}`);
        else await api.post("/favourites", { itemType, itemId });
        return { saved: !wasSaved };
      } catch (err) {
        setIds((prev) => {
          const next = new Set(prev);
          wasSaved ? next.add(key) : next.delete(key);
          return next;
        });
        return { error: err.response?.data?.message || "Could not update favourites" };
      }
    },
    [ids, user]
  );

  const value = useMemo(
    () => ({ ids, count: ids.size, loading, isFavourite, toggle, refresh }),
    [ids, loading, isFavourite, toggle, refresh]
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export const useFavourites = () => useContext(FavouritesContext);
