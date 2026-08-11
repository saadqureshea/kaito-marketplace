import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import FileUpload from "../components/FileUpload.jsx";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [form, setForm] = useState({ coverLetter: "", portfolioUrl: "", proposedRate: "" });
  const [cvUrl, setCvUrl] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then(({ data }) => setJob(data))
      .catch(() => setNotFound(true));

    if (user?.role === "worker") {
      api
        .get("/jobs/applications/mine")
        .then(({ data }) => setAlreadyApplied(data.some((a) => a.job?._id === id)))
        .catch(() => {});
    }
  }, [id, user]);

  if (notFound) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-center text-ink-700/75">Job not found.</p>;
  }
  if (!job) return null;

  const submitApplication = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post(`/jobs/${id}/apply`, {
        coverLetter: form.coverLetter,
        cvUrl: cvUrl[0] || "",
        portfolioUrl: form.portfolioUrl,
        proposedRate: form.proposedRate ? Number(form.proposedRate) : undefined,
      });
      setApplied(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const budget =
    job.budgetType === "hourly"
      ? `$${job.budgetMin ?? "?"}–$${job.budgetMax ?? "?"}/hr`
      : `$${job.budgetMin ?? "?"}–$${job.budgetMax ?? "?"} fixed`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="rounded-full bg-signal-500/10 px-2.5 py-0.5 text-xs font-medium capitalize text-signal-500">
        {job.employmentType.replace(/_/g, " ")}
      </span>
      <h1 className="mt-3 font-display text-2xl font-semibold text-ink-950">{job.title}</h1>
      <p className="mt-1 text-sm text-ink-700/75">
        {job.employer?.name} · {job.location} · {budget}
      </p>

      {job.skillsRequired?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {job.skillsRequired.map((s) => (
            <span key={s} className="rounded-full bg-paper-100 px-2.5 py-0.5 text-xs text-ink-700/70">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 border-t border-line pt-6">
        <h2 className="mb-2 font-display text-lg font-semibold">Description</h2>
        <p className="whitespace-pre-line text-sm text-ink-700/80">{job.description}</p>
      </div>

      <div className="mt-10 card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Apply to this job</h2>

        {!user ? (
          <p className="text-sm text-ink-700/75">
            <Link to={`/login?next=/jobs/${id}`} className="font-medium text-signal-500">
              Log in
            </Link>{" "}
            as a worker to apply.
          </p>
        ) : user.role !== "worker" ? (
          <p className="text-sm text-ink-700/75">Only worker accounts can apply to jobs.</p>
        ) : user.professionalProfile?.approvalStatus !== "approved" ? (
          <p className="text-sm text-ink-700/75">
            Your professional profile must be approved before applying.{" "}
            <Link to="/dashboard/worker" className="font-medium text-signal-500">
              Complete your profile
            </Link>
            .
          </p>
        ) : applied || alreadyApplied ? (
          <p className="rounded-lg bg-green-50 dark:bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
            Application submitted — track its status from your dashboard.
          </p>
        ) : (
          <form onSubmit={submitApplication} className="flex flex-col gap-3">
            {error && <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}
            <textarea
              required
              className="input min-h-[100px]"
              placeholder="Cover letter"
              value={form.coverLetter}
              onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
            />
            <div>
              <label className="mb-1 block text-sm font-medium">CV</label>
              <FileUpload value={cvUrl} onChange={setCvUrl} multiple={false} accept="application/pdf,image/*" label="Upload CV" />
            </div>
            <input
              className="input"
              placeholder="Portfolio URL (optional)"
              value={form.portfolioUrl}
              onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
            />
            <input
              type="number"
              min="0"
              className="input"
              placeholder="Your proposed rate (optional)"
              value={form.proposedRate}
              onChange={(e) => setForm({ ...form, proposedRate: e.target.value })}
            />
            <button disabled={submitting || cvUrl.length === 0} className="btn-primary mt-2 w-fit">
              {submitting ? "Submitting..." : "Submit application"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-10">
        <Link to="/remote-work" className="text-sm text-signal-500 hover:underline">
          &larr; Back to browsing
        </Link>
      </p>
    </div>
  );
}
