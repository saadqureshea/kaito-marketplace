# KAITO MarketPlace

A global digital marketplace and remote work platform with four sections
(Digital Products, Made-to-Order Products, Digital Services, Remote Work),
role-based dashboards with approval workflows, and Stripe Checkout (test
mode) with automated 15% + 5% (20% total) commission split — sellers keep
80%.

## 1. Project layout

```
kaito-marketplace/
├── backend/                    Node.js + Express + MongoDB (Mongoose)
│   ├── config/db.js
│   ├── middleware/{auth,errorMiddleware}.js
│   ├── models/{User,Product,Service,Job,Application,Order}.js
│   ├── routes/{authRoutes,productRoutes,serviceRoutes,jobRoutes,orderRoutes,stripeRoutes,adminRoutes}.js
│   ├── utils/commission.js     the 15/5/20/80 split, single source of truth
│   ├── server.js
│   └── .env.example
└── frontend/                   React 18 + Vite + Tailwind CSS
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/{Navbar,Hero,CategoryTabs,Footer,ProductCard}.jsx
    │   ├── pages/{Home,Login,Register,Checkout}.jsx
    │   ├── pages/Dashboard/{Buyer,Seller,Worker,Employer,Admin}Dashboard.jsx
    │   └── App.jsx
    ├── tailwind.config.js       design tokens (signal-indigo palette)
    └── .env.example
```

## 2. How the pieces fit together

- **Auth**: JWT stored in an httpOnly cookie (+ returned in the response body
  for Bearer-header fallback). `role` on the User model drives which
  dashboard and route guards apply (`buyer`, `seller`, `worker`, `employer`,
  `admin`).
- **Approval workflows**: `Product`, `Service`, and `Job` documents start at
  `pending_review` and only appear in public browse endpoints once an admin
  sets `status: "approved"` via `/api/admin/*`. Worker `professionalProfile`
  follows the same `pending → approved/rejected` pattern, and applying to
  jobs is blocked until a worker's profile is approved.
- **Commission**: `backend/utils/commission.js` is the single place price
  splitting happens — 15% marketplace fee + 5% payment-processing allowance
  = 20% total commission, 80% to the seller. It's called when a checkout
  session is created, and the breakdown is frozen onto the `Order` document
  so historical orders stay accurate even if rates change later.
- **Stripe Checkout (test mode)**: `POST /api/payments/create-checkout-session`
  resolves price server-side (never trusts the client), computes commission,
  stores a `pending` `Order`, and creates a Stripe-hosted Checkout Session
  for the full buyer-facing amount. The buyer is redirected to Stripe, then
  back to `/checkout/success`, which calls `POST /api/payments/confirm-session`
  to verify payment status directly with Stripe before flipping the order to
  `in_production` (made-to-order) or `in_progress` (services). PayPal
  Sandbox checkout code (`routes/paypalRoutes.js`) is still in the repo but
  unmounted - swap it back in `server.js` if you get working PayPal Sandbox
  credentials later.
- **Remote Work messaging**: `Application` documents embed a `messages[]`
  array; `POST /api/jobs/applications/:appId/messages` is used by both the
  employer and the worker on that application.

## 3. Local setup

### Prerequisites
- Node.js 18+
- A MongoDB database (local `mongod` or a free MongoDB Atlas cluster)
- A free Stripe account → test mode API key from
  [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
  (no business verification needed for test mode, unlike PayPal's Sandbox
  app approval)

### Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY
npm install
npm run dev                # http://localhost:5000
npm test                   # unit tests for commission math + role guards
```

### Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL
npm install
npm run dev                 # http://localhost:5173
```

Create your first admin by registering normally, then in MongoDB (Atlas UI,
Compass, or `mongosh`) flip that user's `role` field to `"admin"`.

## 4. Roadmap to production

All six items below are now implemented. Remaining follow-ups are called
out inline.

1. **CRUD screens** ✅ Seller dashboard has a create-listing form (Product
   or Service, with image/file upload); Employer dashboard has a post-job
   form plus an applicant review/status panel; Job detail pages have a
   worker apply form. New pages: `ProductDetail`, `ServiceDetail`,
   `JobDetail`, `Category`, `Search` (`frontend/src/pages/`).
2. **File uploads** ✅ `backend/middleware/upload.js` (multer, local disk,
   5MB/6-file limit, image+PDF+zip/epub mimetypes) + `POST /api/uploads`,
   served back at `/uploads/*`. Frontend `components/FileUpload.jsx` is the
   shared upload control used by listing, job, and application forms.
   Follow-up: swap local disk for S3/Cloudinary before deploying to an
   ephemeral host (Render/Railway don't persist local disk across deploys).
3. **Category/search pages** ✅ `/digital-products`, `/made-to-order`,
   `/services`, `/remote-work` are driven by `pages/Category.jsx`;
   `/search` aggregates keyword results across products/services/jobs.
4. **Reviews & ratings** ✅ `backend/models/Review.js` +
   `routes/reviewRoutes.js` (one review per completed order, recalculates
   the product/service's `rating`/`numReviews`). Buyers leave a review from
   their dashboard once an order is `completed`; detail pages show reviews.
5. **Payout automation** ✅ `backend/utils/paypalPayout.js` calls the
   PayPal Payouts REST API. When a seller marks an order `completed`
   (Seller Dashboard → Recent orders), the 80% seller share is sent to
   `sellerProfile.payoutEmail` (set under Seller Dashboard → Store
   settings) and `Order.payoutReleased` flips to `true`. A failed payout
   (e.g. no payout email yet) is recorded on `Order.payoutError` without
   blocking the status change, so it can be retried.
6. **Testing** ✅ `backend/utils/commission.test.js` and
   `backend/middleware/auth.test.js` use Node's built-in test runner
   (`npm test` → `node --test`, no extra dependencies) covering the
   commission math and role-guard middleware called out above as
   highest-risk.

**Update**: `backend/utils/seed.js` now exists and works — `npm run seed`
populates demo accounts and a full catalog (with placeholder images), so a
fresh install no longer has to start blank. Worker↔employer messaging also
has a dedicated UI now (`components/MessageThread.jsx`), used in both the
Employer and Worker dashboards, not just backend status updates.

**Still open** before a production launch:
- **File storage**: uploads go to local disk via `multer`. Render/Railway's
  free tiers don't persist disk across deploys, so this needs to move to
  S3 or Cloudinary before deploying.
- **PayPal Sandbox credentials**: still placeholders in `.env`. Seller
  payout release fails gracefully (`Order.payoutError` is set, dashboard
  shows "Payout failed") until real sandbox app credentials are added.
- **No Stripe webhook**: order confirmation only happens client-side, when
  the buyer's browser calls `/api/payments/confirm-session` after the
  Stripe redirect. A buyer who closes the tab mid-checkout leaves that
  order stuck at `pending` with no server-side reconciliation job to catch
  it.
- **Not deployed yet**: the repo is pushed to GitHub (single commit so
  far) but none of the deployment steps in section 5 below have been run
  against Render/Railway or Netlify — `CLIENT_URL` and `VITE_API_URL` are
  still pointed at localhost.

## 5. Deployment

### Backend → Render or Railway
1. Push this repo to GitHub.
2. **Render**: New → Web Service → connect the repo → root directory
   `backend` → Build command `npm install` → Start command `npm start`.
   **Railway**: New Project → Deploy from GitHub → set root directory to
   `backend` (Railway auto-detects Node and runs `npm start`).
3. Add environment variables from `backend/.env.example` in the
   service's dashboard (use your **production** Mongo URI, a fresh
   `JWT_SECRET`, and keep `STRIPE_SECRET_KEY` on a `sk_test_...` key until
   you're ready for live payments, then switch to a live secret key).
4. Set `CLIENT_URL` to your deployed Netlify URL (needed for CORS).
5. Deploy — note the resulting API URL, e.g. `https://kaito-api.onrender.com`.

### Frontend → Netlify
1. New site from Git → select the repo → base directory `frontend`.
2. Build command: `npm run build` — Publish directory: `dist`.
3. Add environment variables: `VITE_API_URL=https://kaito-api.onrender.com/api`.
4. Add a `frontend/public/_redirects` file containing `/* /index.html 200`
   so client-side routing (React Router) works on refresh/deep links.
5. Deploy — Netlify gives you a URL like `https://kaito-marketplace.netlify.app`.
6. Go back to Render/Railway and update `CLIENT_URL` to that Netlify URL,
   then redeploy the backend so CORS allows it.

### Testing checkout (Stripe test mode)
No sandbox account needed for the buyer side - Stripe's hosted Checkout
page accepts test card `4242 4242 4242 4242` with any future expiry date,
any 3-digit CVC, and any billing ZIP.

### PayPal Sandbox (seller payouts only)
Seller payout release (`backend/utils/paypalPayout.js`, triggered when a
seller marks an order `completed`) still uses the PayPal Payouts API and
needs working `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` sandbox
credentials from developer.paypal.com → Sandbox → Accounts. Until those
are set, payout release fails gracefully - the order is recorded with
`payoutError` set and the Seller Dashboard shows a "Payout failed" badge,
without blocking the order status change itself.
