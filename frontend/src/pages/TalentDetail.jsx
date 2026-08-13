import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Briefcase, ExternalLink, ShieldCheck, Clock } from "lucide-react";
import AvailabilityPill from "../components/AvailabilityPill.jsx";
import api from "../api/axios.js";
import { assetUrl } from "../utils/url.js";
import { money } from "../utils/format.js";

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function TalentDetail() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/talent/${id}`)
      .then(({ data }) => setWorker(data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-16 text-center text-ink-700/75">
        Talent profile not found.
      </p>
    );
  }
  if (!worker) return null;

  const p = worker.professionalProfile || {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {worker.avatarUrl ? (
            <img
              src={assetUrl(worker.avatarUrl)}
              alt=""
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-signal-500/10 font-display text-xl font-semibold text-signal-600">
              {initials(worker.name)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold text-ink-950">{worker.name}</h1>
            {p.headline && <p className="mt-1 text-ink-700/85">{p.headline}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-700/75">
              {worker.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {worker.country}
                </span>
              )}
              {p.yearsExperience > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {p.yearsExperience} year{p.yearsExperience === 1 ? "" : "s"} experience
                </span>
              )}
              {p.timezone && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {p.timezone}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-signal-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Profile reviewed by KAITO
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AvailabilityPill value={p.availability} />
              {p.languages?.length > 0 && (
                <span className="text-xs text-ink-700/75">
                  Speaks {p.languages.join(", ")}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 sm:text-right">
            <p className="text-[10px] uppercase tracking-wide text-ink-700/70">Hourly rate</p>
            <p className="font-display text-2xl font-semibold text-ink-950">
              {p.hourlyRate ? `${money(p.hourlyRate)}/hr` : "On request"}
            </p>
          </div>
        </div>

        {worker.bio && (
          <div className="mt-6 border-t border-line pt-6">
            <h2 className="mb-2 font-display text-lg font-semibold">About</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700/85">{worker.bio}</p>
          </div>
        )}

        {p.skills?.length > 0 && (
          <div className="mt-6 border-t border-line pt-6">
            <h2 className="mb-3 font-display text-lg font-semibold">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {p.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-paper-100 px-3 py-1 text-xs text-ink-700/85"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
          {p.portfolioUrl && (
            <a
              href={p.portfolioUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="press btn-secondary"
            >
              View portfolio
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          )}
          <Link to="/remote-work" className="press btn-primary">
            Post a job to hire
          </Link>
        </div>

        {/* Contact runs through a job application rather than exposing an
            email address, which also keeps the CV behind its access check. */}
        <p className="mt-4 text-xs text-ink-700/70">
          Professionals are contacted through job applications — post a role and invite them to apply.
        </p>
      </div>

      <p className="mt-8">
        <Link to="/talent" className="text-sm text-signal-500 hover:underline">
          &larr; Back to all talent
        </Link>
      </p>
    </div>
  );
}
