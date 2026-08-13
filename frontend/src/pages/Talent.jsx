import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import api from "../api/axios.js";
import TalentCard from "../components/TalentCard.jsx";
import Pagination from "../components/Pagination.jsx";

const PER_PAGE = 12;

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "experience", label: "Most experienced" },
  { value: "rate_asc", label: "Rate: low to high" },
  { value: "rate_desc", label: "Rate: high to low" },
];

export default function Talent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: undefined, page: 1, pages: 1 });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get("q") || "";
  const skill = searchParams.get("skill") || "";
  const availability = searchParams.get("availability") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === null) next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    api.get("/talent/skills").then(({ data }) => setSkills(data)).catch(() => setSkills([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/talent", {
        params: {
          keyword: keyword || undefined,
          skill: skill || undefined,
          availability: availability || undefined,
          sort: sort !== "newest" ? sort : undefined,
          page,
          limit: PER_PAGE,
        },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setItems(data.items);
        setMeta({ total: data.total, page: data.page, pages: data.pages });
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setMeta({ total: 0, page: 1, pages: 1 });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [keyword, skill, availability, sort, page]);

  const filtersActive = Boolean(keyword || skill || availability);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Hire remote talent</h1>
      <p className="mt-2 max-w-2xl text-ink-700/70">
        Every professional here has had their profile reviewed by our team before going live.
      </p>

      {/* Search + sort */}
      <div className="mb-4 mt-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <p className="text-sm text-ink-700/75">
          {loading ? (
            "Loading..."
          ) : (
            <>
              <span className="font-medium text-ink-950">{meta.total}</span>{" "}
              {meta.total === 1 ? "professional" : "professionals"}
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <input
            defaultValue={keyword}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParams({ q: e.currentTarget.value, page: 1 });
            }}
            placeholder="Search name, headline or skill..."
            aria-label="Search talent"
            className="input !w-56 !py-1.5 text-xs"
          />
          <label className="flex items-center gap-2 text-xs text-ink-700/75">
            <span className="hidden sm:inline">Availability</span>
            <select
              value={availability}
              onChange={(e) => updateParams({ availability: e.target.value, page: 1 })}
              className="input !w-auto !py-1.5 text-xs"
            >
              <option value="">Any availability</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs text-ink-700/75">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
              className="input !w-auto !py-1.5 text-xs"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Skill chips */}
      {skills.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {skills.slice(0, 14).map((s) => (
            <button
              key={s}
              onClick={() => updateParams({ skill: skill === s ? undefined : s, page: 1 })}
              className={`press rounded-full border px-2.5 py-1 text-xs transition ${
                skill === s
                  ? "border-signal-500 bg-signal-500/10 text-signal-600"
                  : "border-line text-ink-700/75 hover:border-signal-500 hover:text-signal-500"
              }`}
            >
              {s}
            </button>
          ))}
          {filtersActive && (
            <button
              onClick={() =>
                updateParams({ q: undefined, skill: undefined, availability: undefined, page: 1 })
              }
              className="press inline-flex items-center gap-1 px-2 py-1 text-xs text-ink-700/75 hover:text-signal-500"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-48 animate-pulse bg-paper-50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-line p-10 text-center">
          <p className="text-ink-700/75">
            {filtersActive
              ? "No professionals match those filters."
              : "No approved profiles yet — workers appear here once an admin approves them."}
          </p>
          {filtersActive && (
            <button
              onClick={() =>
                updateParams({ q: undefined, skill: undefined, availability: undefined, page: 1 })
              }
              className="press btn-secondary mt-4"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((w, i) => (
            <div key={w._id} className="rise" style={{ "--i": i }}>
              <TalentCard worker={w} />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <Pagination page={meta.page} pages={meta.pages} onChange={(p) => updateParams({ page: p })} />
      )}
    </section>
  );
}
