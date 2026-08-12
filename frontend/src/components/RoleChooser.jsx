import { Link } from "react-router-dom";
import { ShoppingBag, Store, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Front-door role split. A visitor shouldn't have to work out which side of
 * the marketplace they're on, so both paths are stated plainly above the fold.
 * Destinations adapt once we know who's signed in - an existing seller goes
 * straight to their dashboard rather than back through registration.
 */
export default function RoleChooser({ className = "" }) {
  const { user } = useAuth();

  const sellerPath = !user
    ? "/register?role=seller"
    : user.role === "seller" || user.role === "admin"
    ? "/dashboard/seller"
    : "/register?role=seller";

  const options = [
    {
      to: "/digital-products",
      icon: ShoppingBag,
      label: "I'm a Buyer",
      detail: "Browse products, services and hire remote talent",
      cta: "Start browsing",
    },
    {
      to: sellerPath,
      icon: Store,
      label: "I'm a Seller",
      detail: "List your work and keep 80% of every sale",
      cta: user?.role === "seller" ? "Go to dashboard" : "Start selling",
    },
  ];

  // Two columns at every width: on phones the cards drop their description
  // and sit side by side, so the role choice stays above the fold alongside
  // the listings rather than being pushed off-screen.
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {options.map(({ to, icon: Icon, label, detail, cta }) => (
        <Link
          key={label}
          to={to}
          className="card group flex items-start gap-2.5 p-3 transition duration-200 hover:-translate-y-0.5 hover:border-signal-500 hover:shadow-lg sm:gap-3 sm:p-4"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-signal-500/10 text-signal-500 transition group-hover:bg-signal-500 group-hover:text-on-brand sm:h-10 sm:w-10">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-sm font-semibold text-ink-950 sm:text-base">
              {label}
            </span>
            <span className="mt-0.5 hidden text-xs leading-relaxed text-ink-700/75 sm:block">
              {detail}
            </span>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-signal-500 sm:mt-2">
              {cta}
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
