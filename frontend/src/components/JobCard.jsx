import { Link } from "react-router-dom";
import { MapPin, Users, Wallet } from "lucide-react";
import Badge from "./Badge.jsx";
import { timeAgo, titleize } from "../utils/format.js";

const MAX_SKILLS = 4;

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function budgetLabel(job) {
  const { budgetMin, budgetMax, budgetType, currency = "USD" } = job;
  const symbol = currency === "USD" ? "$" : `${currency} `;
  const suffix = budgetType === "hourly" ? "/hr" : "";
  if (budgetMin && budgetMax) return `${symbol}${budgetMin}–${symbol}${budgetMax}${suffix}`;
  if (budgetMin) return `From ${symbol}${budgetMin}${suffix}`;
  if (budgetMax) return `Up to ${symbol}${budgetMax}${suffix}`;
  return "Budget on request";
}

export default function JobCard({ job }) {
  const employerName = job.employer?.sellerProfile?.storeName || job.employer?.name || "Employer";
  const skills = job.skillsRequired || [];
  const overflow = skills.length - MAX_SKILLS;

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="card group flex gap-4 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-signal-500 hover:shadow-lg"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-signal-500/10 font-display text-sm font-semibold text-signal-600">
        {initials(employerName)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <h3 className="font-display text-base font-semibold leading-snug text-ink-950 group-hover:text-signal-600">
            {job.title}
          </h3>
          <Badge tone="signal">{titleize(job.employmentType)}</Badge>
        </div>

        <p className="mt-0.5 text-sm text-ink-700/60">
          {employerName}
          {job.createdAt && <span className="text-ink-700/40"> · {timeAgo(job.createdAt)}</span>}
        </p>

        {job.description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-700/70">{job.description}</p>
        )}

        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.slice(0, MAX_SKILLS).map((s) => (
              <span
                key={s}
                className="rounded-full bg-paper-100 px-2 py-0.5 text-[11px] text-ink-700/70"
              >
                {s}
              </span>
            ))}
            {overflow > 0 && (
              <span className="px-1 py-0.5 text-[11px] text-ink-700/45">+{overflow} more</span>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-ink-700/60">
          <span className="inline-flex items-center gap-1 font-medium text-ink-900">
            <Wallet className="h-3.5 w-3.5 text-ink-700/50" />
            {budgetLabel(job)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location || "Remote"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {job.applicantCount || 0} applicant{job.applicantCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </Link>
  );
}
