import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-950">Marketplace</h4>
            <ul className="space-y-2 text-sm text-ink-700/70">
              <li><Link to="/digital-products" className="hover:text-signal-500">Digital Products</Link></li>
              <li><Link to="/made-to-order" className="hover:text-signal-500">Made-to-Order</Link></li>
              <li><Link to="/services" className="hover:text-signal-500">Digital Services</Link></li>
              <li><Link to="/remote-work" className="hover:text-signal-500">Remote Work</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-950">Sell on KAITO</h4>
            <ul className="space-y-2 text-sm text-ink-700/70">
              <li><Link to="/register?role=seller" className="hover:text-signal-500">Become a Seller</Link></li>
              <li><Link to="/register?role=worker" className="hover:text-signal-500">Create a Worker Profile</Link></li>
              <li><Link to="/register?role=employer" className="hover:text-signal-500">Post a Job</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-950">Company</h4>
            <ul className="space-y-2 text-sm text-ink-700/70">
              <li><Link to="/about" className="hover:text-signal-500">About KAITO</Link></li>
              <li><Link to="/pricing" className="hover:text-signal-500">Fees & Commission</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-950">Support</h4>
            <ul className="space-y-2 text-sm text-ink-700/70">
              <li><Link to="/help" className="hover:text-signal-500">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-signal-500">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-ink-700/75 sm:flex-row">
          <span>© {new Date().getFullYear()} KAITO MarketPlace. All rights reserved.</span>
          <span>Payments processed via Stripe.</span>
        </div>
      </div>
    </footer>
  );
}
