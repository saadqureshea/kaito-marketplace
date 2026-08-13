import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-950">{t("footer.marketplaceHeading")}</h4>
            <ul className="space-y-2 text-sm text-ink-700/70">
              <li><Link to="/digital-products" className="hover:text-signal-500">{t("nav.digitalProducts")}</Link></li>
              <li><Link to="/made-to-order" className="hover:text-signal-500">{t("nav.madeToOrder")}</Link></li>
              <li><Link to="/services" className="hover:text-signal-500">{t("footer.servicesLabel")}</Link></li>
              <li><Link to="/remote-work" className="hover:text-signal-500">{t("nav.remoteWork")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-950">{t("footer.sellHeading")}</h4>
            <ul className="space-y-2 text-sm text-ink-700/70">
              <li><Link to="/register?role=seller" className="hover:text-signal-500">{t("footer.becomeSeller")}</Link></li>
              <li><Link to="/register?role=worker" className="hover:text-signal-500">{t("footer.createWorkerProfile")}</Link></li>
              <li><Link to="/register?role=employer" className="hover:text-signal-500">{t("footer.postJob")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-950">{t("footer.companyHeading")}</h4>
            <ul className="space-y-2 text-sm text-ink-700/70">
              <li><Link to="/about" className="hover:text-signal-500">{t("footer.about")}</Link></li>
              <li><Link to="/pricing" className="hover:text-signal-500">{t("footer.pricing")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-950">{t("footer.supportHeading")}</h4>
            <ul className="space-y-2 text-sm text-ink-700/70">
              <li><Link to="/help" className="hover:text-signal-500">{t("footer.helpCenter")}</Link></li>
              <li><Link to="/contact" className="hover:text-signal-500">{t("footer.contact")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-ink-700/75 sm:flex-row">
          <span>{t("footer.rights", new Date().getFullYear())}</span>
          <span>{t("footer.paymentsNote")}</span>
        </div>
      </div>
    </footer>
  );
}
