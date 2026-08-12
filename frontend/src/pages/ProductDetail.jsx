import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star } from "lucide-react";
import api from "../api/axios.js";
import { assetUrl } from "../utils/url.js";
import { useAuth } from "../context/AuthContext.jsx";
import ReviewList from "../components/ReviewList.jsx";
import AddToCartButton from "../components/AddToCartButton.jsx";
import VerifiedMark from "../components/VerifiedMark.jsx";
import ProductRow from "../components/ProductRow.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-center text-ink-700/75">Product not found.</p>;
  }
  if (!product) return null;

  const buyNow = () => {
    if (!user) return navigate(`/login?next=/products/${id}`);
    navigate(`/checkout?itemType=product&itemId=${id}&qty=1`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl2 border border-line bg-paper-100">
            {product.images?.[activeImage] ? (
              <img
                src={assetUrl(product.images[activeImage])}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-700/30">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border ${
                    i === activeImage ? "border-signal-500" : "border-line"
                  }`}
                >
                  <img src={assetUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="rounded-full bg-signal-500/10 px-2.5 py-0.5 text-xs font-medium text-signal-500">
            {product.listingType === "digital" ? "Digital Product" : "Made-to-Order"}
          </span>
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink-950">{product.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-700/75">
            <span>by {product.seller?.sellerProfile?.storeName || product.seller?.name}</span>
            {product.seller?.sellerProfile?.isVerifiedSeller && <VerifiedMark withLabel />}
          </p>

          {product.rating > 0 && (
            <span className="mt-2 flex items-center gap-1 text-sm text-ink-700/70">
              <Star className="h-4 w-4 fill-kaito-gold text-kaito-gold" /> {product.rating.toFixed(1)} (
              {product.numReviews} review{product.numReviews === 1 ? "" : "s"})
            </span>
          )}

          <p className="mt-5 font-display text-3xl font-semibold text-ink-950">
            ${product.price?.toFixed(2)} <span className="text-sm font-normal text-ink-700/75">{product.currency}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={buyNow} className="press btn-primary">
              Buy now
            </button>
            <AddToCartButton
              variant="full"
              item={{
                itemType: "product",
                itemId: product._id,
                title: product.title,
                price: product.price,
                image: product.images?.[0],
                sellerName: product.seller?.sellerProfile?.storeName || product.seller?.name,
              }}
            />
          </div>

          {product.listingType === "made_to_order" && product.productionDetails?.leadTimeDays && (
            <p className="mt-4 text-sm text-ink-700/75">
              Lead time: {product.productionDetails.leadTimeDays} day(s)
              {product.productionDetails.customizationOptions?.length > 0 &&
                ` · Options: ${product.productionDetails.customizationOptions.join(", ")}`}
            </p>
          )}

          <div className="mt-6 border-t border-line pt-6">
            <h2 className="mb-2 font-display text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-line text-sm text-ink-700/80">{product.description}</p>
          </div>

          {product.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="rounded-full bg-paper-100 px-2.5 py-0.5 text-xs text-ink-700/70">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-14">
        <h2 className="mb-4 font-display text-xl font-semibold">Reviews</h2>
        <ReviewList itemType="product" itemId={id} />
      </div>

      <div className="mt-16">
        <ProductRow
          endpoint={`/products/${id}/related`}
          eyebrow="You may also like"
          title="Similar listings"
          subtitle="Picked from the same category and tags."
        />
      </div>

      <p className="mt-10">
        <Link to="/digital-products" className="text-sm text-signal-500 hover:underline">
          &larr; Back to browsing
        </Link>
      </p>
    </div>
  );
}
