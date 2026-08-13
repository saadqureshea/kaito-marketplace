import { useEffect, useState } from "react";
import Hero from "../components/Hero.jsx";
import TrustBar from "../components/TrustBar.jsx";
import CategoryTabs from "../components/CategoryTabs.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import JobCard from "../components/JobCard.jsx";
import ProductRow from "../components/ProductRow.jsx";
import TalentCard from "../components/TalentCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import api from "../api/axios.js";

function EmptyState({ children }) {
  return (
    <p className="rounded-xl2 border border-dashed border-line bg-paper-50 p-10 text-center text-sm text-ink-700/75">
      {children}
    </p>
  );
}

function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="aspect-[4/3] w-full animate-pulse bg-paper-100" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-paper-100" />
            <div className="h-4 w-full animate-pulse rounded bg-paper-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-paper-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState(null);
  const [services, setServices] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [talent, setTalent] = useState(null);

  useEffect(() => {
    api.get("/products", { params: { limit: 12 } })
      .then(({ data }) => setProducts(data.items))
      .catch(() => setProducts([]));

    api.get("/services", { params: { limit: 4 } })
      .then(({ data }) => setServices(data.items))
      .catch(() => setServices([]));

    api.get("/jobs", { params: { limit: 3 } })
      .then(({ data }) => setJobs(data.items))
      .catch(() => setJobs([]));

    api.get("/talent", { params: { limit: 3 } })
      .then(({ data }) => setTalent(data.items))
      .catch(() => setTalent([]));
  }, []);

  // The hero features the first four; the grid below picks up from there so
  // the same listings aren't shown twice on one screen.
  const gridProducts = products === null ? null : products.slice(4);

  return (
    <>
      <Hero products={products} />
      <CategoryTabs />

      {/* Only meaningful once we know who's looking; ProductRow renders
          nothing if the endpoint comes back empty. */}
      {user && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <ProductRow
            endpoint="/products/mine/recommended"
            eyebrow={t("home.recommendedEyebrow")}
            title={t("home.recommendedTitle")}
            subtitle={t("home.recommendedSubtitle")}
          />
        </section>
      )}

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("home.marketplaceEyebrow")}
          title={t("home.marketplaceTitle")}
          subtitle={t("home.marketplaceSubtitle")}
          to="/digital-products"
        />
        {gridProducts === null ? (
          <CardGridSkeleton />
        ) : gridProducts.length === 0 ? (
          <EmptyState>{t("home.noMoreProducts")}</EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {gridProducts.map((p, i) => (
              <div key={p._id} className="rise" style={{ "--i": i }}>
                <ProductCard item={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Services */}
      <section className="border-t border-line bg-paper-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={t("home.servicesEyebrow")}
            title={t("home.servicesTitle")}
            subtitle={t("home.servicesSubtitle")}
            to="/services"
          />
          {services === null ? (
            <CardGridSkeleton />
          ) : services.length === 0 ? (
            <EmptyState>{t("home.noServices")}</EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {services.map((s, i) => (
                <div key={s._id} className="rise" style={{ "--i": i }}>
                  <ServiceCard item={s} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Jobs */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("home.jobsEyebrow")}
          title={t("home.jobsTitle")}
          subtitle={t("home.jobsSubtitle")}
          to="/remote-work"
          linkLabel={t("home.browseAllJobs")}
        />
        {jobs === null ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card h-32 animate-pulse bg-paper-50" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState>{t("home.noJobs")}</EmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map((j, i) => (
              <div key={j._id} className="rise" style={{ "--i": i }}>
                <JobCard job={j} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Talent */}
      {talent === null ? null : talent.length > 0 ? (
        <section className="border-t border-line bg-paper-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow={t("home.talentEyebrow")}
              title={t("home.talentTitle")}
              subtitle={t("home.talentSubtitle")}
              to="/talent"
              linkLabel={t("home.browseAllTalent")}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {talent.map((w, i) => (
                <div key={w._id} className="rise" style={{ "--i": i }}>
                  <TalentCard worker={w} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <TrustBar />
      <HowItWorks />
    </>
  );
}
