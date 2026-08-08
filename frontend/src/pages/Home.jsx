import { useEffect, useState } from "react";
import Hero from "../components/Hero.jsx";
import TrustBar from "../components/TrustBar.jsx";
import CategoryTabs from "../components/CategoryTabs.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import JobCard from "../components/JobCard.jsx";
import api from "../api/axios.js";

function EmptyState({ children }) {
  return (
    <p className="rounded-xl2 border border-dashed border-line bg-paper-50 p-10 text-center text-sm text-ink-700/55">
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
  const [products, setProducts] = useState(null);
  const [services, setServices] = useState(null);
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    api.get("/products", { params: { limit: 8 } })
      .then(({ data }) => setProducts(data.items))
      .catch(() => setProducts([]));

    api.get("/services", { params: { limit: 4 } })
      .then(({ data }) => setServices(data.items))
      .catch(() => setServices([]));

    api.get("/jobs", { params: { limit: 3 } })
      .then(({ data }) => setJobs(data.items))
      .catch(() => setJobs([]));
  }, []);

  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryTabs />

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Marketplace"
          title="Fresh on the marketplace"
          subtitle="Newly approved digital downloads and made-to-order pieces."
          to="/digital-products"
        />
        {products === null ? (
          <CardGridSkeleton />
        ) : products.length === 0 ? (
          <EmptyState>No listings yet — approved products will appear here once sellers start publishing.</EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} item={p} />
            ))}
          </div>
        )}
      </section>

      {/* Services */}
      <section className="border-t border-line bg-paper-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Professional services"
            title="Hire a specialist"
            subtitle="Tiered packages with fixed scope and delivery times."
            to="/services"
          />
          {services === null ? (
            <CardGridSkeleton />
          ) : services.length === 0 ? (
            <EmptyState>No services listed yet.</EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {services.map((s) => (
                <ServiceCard key={s._id} item={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Jobs */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Remote work"
          title="Open positions"
          subtitle="Roles from employers hiring across the KAITO network."
          to="/remote-work"
          linkLabel="Browse all jobs"
        />
        {jobs === null ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card h-32 animate-pulse bg-paper-50" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState>No open roles right now — check back soon.</EmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map((j) => (
              <JobCard key={j._id} job={j} />
            ))}
          </div>
        )}
      </section>

      <HowItWorks />
    </>
  );
}
