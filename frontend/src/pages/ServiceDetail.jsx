import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, Check } from "lucide-react";
import api from "../api/axios.js";
import { assetUrl } from "../utils/url.js";
import { useAuth } from "../context/AuthContext.jsx";
import ReviewList from "../components/ReviewList.jsx";

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/services/${id}`)
      .then(({ data }) => {
        setService(data);
        setSelectedPkg(data.packages?.[0]?.name);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-center text-ink-700/75">Service not found.</p>;
  }
  if (!service) return null;

  const pkg = service.packages.find((p) => p.name === selectedPkg) || service.packages[0];

  const buyNow = () => {
    if (!user) return navigate(`/login?next=/services/${id}`);
    navigate(`/checkout?itemType=service&itemId=${id}&package=${pkg.name}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl2 border border-line bg-paper-100">
            {service.images?.[0] ? (
              <img src={assetUrl(service.images[0])} alt={service.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-700/30">No image</div>
            )}
          </div>

          <span className="mt-5 inline-block rounded-full bg-signal-500/10 px-2.5 py-0.5 text-xs font-medium text-signal-500">
            {service.category.replace(/_/g, " ")}
          </span>
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink-950">{service.title}</h1>
          <p className="mt-1 text-sm text-ink-700/75">by {service.seller?.sellerProfile?.storeName || service.seller?.name}</p>

          {service.rating > 0 && (
            <span className="mt-2 flex items-center gap-1 text-sm text-ink-700/70">
              <Star className="h-4 w-4 fill-kaito-gold text-kaito-gold" /> {service.rating.toFixed(1)} (
              {service.numReviews} review{service.numReviews === 1 ? "" : "s"})
            </span>
          )}

          <div className="mt-6 border-t border-line pt-6">
            <h2 className="mb-2 font-display text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-line text-sm text-ink-700/80">{service.description}</p>
          </div>

          <div className="mt-14">
            <h2 className="mb-4 font-display text-xl font-semibold">Reviews</h2>
            <ReviewList itemType="service" itemId={id} />
          </div>
        </div>

        <div>
          <div className="card sticky top-24 p-5">
            <div className="mb-4 flex rounded-lg border border-line p-1">
              {service.packages.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedPkg(p.name)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition ${
                    p.name === selectedPkg ? "bg-signal-500 text-white" : "text-ink-700/75"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <h3 className="font-display text-lg font-semibold">{pkg.title}</h3>
            <p className="mt-1 text-sm text-ink-700/70">{pkg.description}</p>

            <p className="mt-4 font-display text-2xl font-semibold">${pkg.price.toFixed(2)}</p>

            <ul className="mt-4 space-y-1.5 text-sm text-ink-700/70">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-signal-500" /> {pkg.deliveryDays}-day delivery
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-signal-500" /> {pkg.revisions} revision{pkg.revisions === 1 ? "" : "s"}
              </li>
            </ul>

            <button onClick={buyNow} className="btn-primary mt-6 w-full">
              Continue (${pkg.price.toFixed(2)})
            </button>
          </div>
        </div>
      </div>

      <p className="mt-10">
        <Link to="/services" className="text-sm text-signal-500 hover:underline">
          &larr; Back to browsing
        </Link>
      </p>
    </div>
  );
}
