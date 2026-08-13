import { ShieldCheck, Lock, Wallet, BadgeCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function TrustBar() {
  const { t } = useLanguage();

  const items = [
    { icon: ShieldCheck, label: t("trust.item1Label"), detail: t("trust.item1Detail") },
    { icon: Lock, label: t("trust.item2Label"), detail: t("trust.item2Detail") },
    { icon: Wallet, label: t("trust.item3Label"), detail: t("trust.item3Detail") },
    { icon: BadgeCheck, label: t("trust.item4Label"), detail: t("trust.item4Detail") },
  ];

  return (
    <section className="border-b border-line bg-paper-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal-500/10 text-signal-500">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-950">{label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-700/75">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
