import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useFavourites } from "../context/FavouritesContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import CartBadge from "./CartBadge.jsx";

const dashboardPathFor = (role) =>
  ({
    buyer: "/dashboard/buyer",
    seller: "/dashboard/seller",
    worker: "/dashboard/worker",
    employer: "/dashboard/employer",
    admin: "/dashboard/admin",
  }[role] || "/dashboard/buyer");

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count: favouriteCount } = useFavourites();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-500 font-display text-sm font-bold text-on-brand">
            K
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink-950">
            KAITO
          </span>
        </Link>

        {/* Search - desktop */}
        <form onSubmit={submitSearch} className="relative hidden flex-1 max-w-xl md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates, services, jobs..."
            className="input pl-9"
          />
        </form>

        {/* Desktop nav */}
        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <Link to="/digital-products" className="text-sm font-medium text-ink-900 hover:text-signal-500">
            Digital Products
          </Link>
          <Link to="/made-to-order" className="text-sm font-medium text-ink-900 hover:text-signal-500">
            Made-to-Order
          </Link>
          <Link to="/services" className="text-sm font-medium text-ink-900 hover:text-signal-500">
            Services
          </Link>
          <Link to="/remote-work" className="text-sm font-medium text-ink-900 hover:text-signal-500">
            Remote Work
          </Link>
          <Link to="/talent" className="text-sm font-medium text-ink-900 hover:text-signal-500">
            Hire Talent
          </Link>

          <ThemeToggle />
          {user && (
            <Link
              to="/favourites"
              aria-label="Saved items"
              title="Saved"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-700/75 transition hover:border-signal-500 hover:text-signal-500"
            >
              <Heart className="h-4 w-4" />
              {favouriteCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-signal-500 px-1 text-[10px] font-semibold leading-none text-on-brand">
                  {favouriteCount > 99 ? "99+" : favouriteCount}
                </span>
              )}
            </Link>
          )}
          <CartBadge />

          {user ? (
            <div className="flex items-center gap-3">
              <Link to={dashboardPathFor(user.role)} className="btn-secondary !px-4 !py-2">
                <User className="mr-1.5 h-4 w-4" /> {user.name.split(" ")[0]}
              </Link>
              <button onClick={logout} className="text-sm text-ink-700/75 hover:text-ink-900">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-ink-900 hover:text-signal-500">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Join KAITO
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggles */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <CartBadge />
          <button onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-surface px-4 pb-4 pt-3 md:hidden">
          <form onSubmit={submitSearch} className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search KAITO..."
              className="input pl-9"
            />
          </form>
          <div className="flex flex-col gap-3 text-sm font-medium">
            <Link to="/digital-products" onClick={() => setOpen(false)}>Digital Products</Link>
            <Link to="/made-to-order" onClick={() => setOpen(false)}>Made-to-Order</Link>
            <Link to="/services" onClick={() => setOpen(false)}>Services</Link>
            <Link to="/remote-work" onClick={() => setOpen(false)}>Remote Work</Link>
            <Link to="/talent" onClick={() => setOpen(false)}>Hire Talent</Link>
            <hr className="border-line" />
            {user ? (
              <>
                <Link to={dashboardPathFor(user.role)} onClick={() => setOpen(false)}>Dashboard</Link>
                <Link to="/favourites" onClick={() => setOpen(false)}>Saved</Link>
                <button onClick={logout} className="text-left text-ink-700/75">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/register" className="btn-primary w-fit" onClick={() => setOpen(false)}>Join KAITO</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
