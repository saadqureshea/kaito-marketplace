import { Link } from "react-router-dom";
import { MapPin, Briefcase, Clock } from "lucide-react";
import AvailabilityPill from "./AvailabilityPill.jsx";
import FavouriteButton from "./FavouriteButton.jsx";
import { assetUrl } from "../utils/url.js";
import { money } from "../utils/format.js";

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

export default function TalentCard({ worker }) {
  const p = worker.professionalProfile || {};
  const skills = p.skills || [];
  const overflow = skills.length - MAX_SKILLS;

  return (
    <Link
      to={`/talent/${worker._id}`}
      className="card group flex flex-col p-5 transition duration-200 hover:-translate-y-1 hover:border-signal-500 hover:shadow-lg"
    >
      <div className="flex items-start gap-3">
        {worker.avatarUrl ? (
          <img
            src={assetUrl(worker.avatarUrl)}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-signal-500/10 font-display text-sm font-semibold text-signal-600">
            {initials(worker.name)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-base font-semibold text-ink-950 group-hover:text-signal-600">
              {worker.name}
            </h3>
            <FavouriteButton itemType="talent" itemId={worker._id} />
          </div>
          {p.headline && (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-700/75">{p.headline}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-700/75">
        {worker.country && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {worker.country}
          </span>
        )}
        {p.yearsExperience > 0 && (
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {p.yearsExperience} yr{p.yearsExperience === 1 ? "" : "s"}
          </span>
        )}
        {p.timezone && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {p.timezone}
          </span>
        )}
      </div>

      {p.availability && (
        <span className="mt-2 w-fit">
          <AvailabilityPill value={p.availability} />
        </span>
      )}

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, MAX_SKILLS).map((s) => (
            <span key={s} className="rounded-full bg-paper-100 px-2 py-0.5 text-[11px] text-ink-700/75">
              {s}
            </span>
          ))}
          {overflow > 0 && (
            <span className="px-1 py-0.5 text-[11px] text-ink-700/70">+{overflow}</span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-end justify-between pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-700/70">Hourly rate</p>
          <span className="font-display text-lg font-semibold text-ink-950">
            {p.hourlyRate ? `${money(p.hourlyRate)}/hr` : "On request"}
          </span>
        </div>
        <span className="text-xs font-semibold text-signal-500">View profile</span>
      </div>
    </Link>
  );
}
