/**
 * Whitelisted sort orders. Query values are mapped to fixed Mongo sort specs
 * rather than passed through, so a client can't sort by an arbitrary field.
 */
const SORTS = {
  newest: "-createdAt",
  oldest: "createdAt",
  price_asc: "price",
  price_desc: "-price",
  rating: "-rating -numReviews",
  popular: "-totalSold -createdAt",
};

// Services price lives inside packages[], so they sort on order volume and
// rating instead of a top-level price field.
const SERVICE_SORTS = {
  newest: "-createdAt",
  oldest: "createdAt",
  rating: "-rating -numReviews",
  popular: "-totalOrders -createdAt",
};

const JOB_SORTS = {
  newest: "-createdAt",
  oldest: "createdAt",
  budget_asc: "budgetMin",
  budget_desc: "-budgetMax",
  applicants: "-applicantCount",
};

export const productSort = (key) => SORTS[key] || SORTS.newest;
export const serviceSort = (key) => SERVICE_SORTS[key] || SERVICE_SORTS.newest;
export const jobSort = (key) => JOB_SORTS[key] || JOB_SORTS.newest;

export { SORTS, SERVICE_SORTS, JOB_SORTS };
