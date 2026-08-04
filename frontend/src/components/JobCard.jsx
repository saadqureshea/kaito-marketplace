import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";

export default function JobCard({ job }) {
  const budget =
    job.budgetType === "hourly"
      ? `$${job.budgetMin ?? "?"}–$${job.budgetMax ?? "?"}/hr`
      : `$${job.budgetMin ?? "?"}–$${job.budgetMax ?? "?"}`;

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="card flex flex-col gap-2 p-5 transition hover:-translate-y-0.5 hover:border-signal-500"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display font-semibold text-ink-950">{job.title}</h3>
        <span className="shrink-0 rounded-full bg-signal-500/10 px-2.5 py-0.5 text-xs font-medium capitalize text-signal-500">
          {job.employmentType.replace(/_/g, " ")}
        </span>
      </div>
      <p className="text-sm text-ink-700/60">{job.employer?.name}</p>
      <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-ink-700/60">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {budget}
        </span>
      </div>
    </Link>
  );
}
