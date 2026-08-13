import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    { n: "01", title: t("howItWorks.step1Title"), body: t("howItWorks.step1Body") },
    { n: "02", title: t("howItWorks.step2Title"), body: t("howItWorks.step2Body") },
    { n: "03", title: t("howItWorks.step3Title"), body: t("howItWorks.step3Body") },
  ];

  return (
    <section className="border-t border-line bg-paper-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-signal-500">{t("howItWorks.eyebrow")}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
          {t("howItWorks.title")}
        </h2>
        <p className="mt-2 max-w-2xl text-ink-700/70">
          {t("howItWorks.subtitle")}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="card relative p-6">
              <span className="font-display text-3xl font-semibold text-signal-500/25">{s.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-ink-950">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700/70">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register?role=seller" className="btn-primary">
            {t("howItWorks.startSelling")}
          </Link>
          <Link to="/register?role=worker" className="btn-secondary">
            {t("howItWorks.createWorkerProfile")}
          </Link>
        </div>
      </div>
    </section>
  );
}
