// Shared display formatters for listing/job cards.

export function timeAgo(dateString) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value === 1 ? "" : "s"} ago`;
  }
  return "just now";
}

// "New" is derived from createdAt rather than stored, so it expires on its own.
export function isNew(dateString, days = 14) {
  if (!dateString) return false;
  return Date.now() - new Date(dateString).getTime() < days * 86400 * 1000;
}

export function money(amount, currency = "USD") {
  if (typeof amount !== "number") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// 1200 -> "1.2k", keeps sold/applicant counts from wrapping on small cards
export function compact(n) {
  if (typeof n !== "number") return "0";
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
}

export function titleize(slug = "") {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
