import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { assetUrl } from "../../utils/url.js";
import api from "../../api/axios.js";
import MessageThread from "../../components/MessageThread.jsx";

const STATUS_OPTIONS = ["submitted", "shortlisted", "interviewing", "hired", "rejected"];

const emptyJob = {
  title: "",
  description: "",
  category: "",
  skillsRequired: "",
  employmentType: "freelance_project",
  budgetType: "fixed",
  budgetMin: "",
  budgetMax: "",
  isRemote: true,
  location: "Remote",
};

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedJob, setExpandedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [expandedApplicant, setExpandedApplicant] = useState(null);

  const load = () => api.get("/jobs/mine/list").then(({ data }) => setJobs(data));

  useEffect(load, []);

  const toggleApplicants = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }
    setExpandedJob(jobId);
    const { data } = await api.get(`/jobs/${jobId}/applications`);
    setApplicants(data);
  };

  const updateApplicantStatus = async (appId, status) => {
    await api.put(`/jobs/applications/${appId}/status`, { status });
    setApplicants((prev) => prev.map((a) => (a._id === appId ? { ...a, status } : a)));
  };

  const submitJob = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.post("/jobs", {
        title: form.title,
        description: form.description,
        category: form.category,
        skillsRequired: form.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
        employmentType: form.employmentType,
        budgetType: form.budgetType,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        isRemote: form.isRemote,
        location: form.location,
      });
      setForm(emptyJob);
      setSuccess("Job posted — pending admin review.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not post job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold">Employer Dashboard</h1>

      <div className="mb-10 card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Post a job</h2>
        {error && <p className="mb-3 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}
        {success && <p className="mb-3 rounded-lg bg-green-50 dark:bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300">{success}</p>}

        <form onSubmit={submitJob} className="flex flex-col gap-3">
          <input
            required
            className="input"
            placeholder="Job title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            required
            className="input min-h-[100px]"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              className="input"
              placeholder="Category (e.g. Development)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              className="input"
              placeholder="Skills, comma separated"
              value={form.skillsRequired}
              onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="input"
              value={form.employmentType}
              onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
            >
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance_project">Freelance project</option>
            </select>
            <select
              className="input"
              value={form.budgetType}
              onChange={(e) => setForm({ ...form, budgetType: e.target.value })}
            >
              <option value="fixed">Fixed budget</option>
              <option value="hourly">Hourly rate</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              className="input"
              placeholder="Budget min (USD)"
              value={form.budgetMin}
              onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
            />
            <input
              type="number"
              min="0"
              className="input"
              placeholder="Budget max (USD)"
              value={form.budgetMax}
              onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
            />
          </div>
          <input
            className="input"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <button disabled={submitting} className="btn-primary mt-2 w-fit">
            {submitting ? "Posting..." : "Post job for review"}
          </button>
        </form>
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold">Your job postings</h2>
      <div className="card divide-y divide-line">
        {jobs.length === 0 ? (
          <p className="p-6 text-sm text-ink-700/60">No job postings yet.</p>
        ) : (
          jobs.map((j) => (
            <div key={j._id}>
              <div className="flex items-center justify-between p-4 text-sm">
                <div>
                  <Link to={`/jobs/${j._id}`} className="font-medium hover:text-signal-500">
                    {j.title}
                  </Link>
                  <button
                    onClick={() => toggleApplicants(j._id)}
                    className="block text-ink-700/60 hover:text-signal-500"
                  >
                    {j.applicantCount} applicant(s) {expandedJob === j._id ? "▲" : "▼"}
                  </button>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    j.status === "open"
                      ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300"
                      : j.status === "rejected"
                      ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300"
                      : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {j.status.replace("_", " ")}
                </span>
              </div>

              {expandedJob === j._id && (
                <div className="divide-y divide-line bg-paper-50 px-4">
                  {applicants.length === 0 ? (
                    <p className="py-4 text-xs text-ink-700/60">No applicants yet.</p>
                  ) : (
                    applicants.map((a) => (
                      <div key={a._id} className="flex flex-col gap-2 py-4 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-ink-950">{a.worker?.name}</span>
                          <select
                            className="input !w-auto !py-1 text-xs"
                            value={a.status}
                            onChange={(e) => updateApplicantStatus(a._id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="text-ink-700/70">{a.coverLetter}</p>
                        <div className="flex items-center gap-3 text-signal-500">
                          {a.cvUrl && (
                            <a href={assetUrl(a.cvUrl)} target="_blank" rel="noreferrer" className="hover:underline">
                              View CV
                            </a>
                          )}
                          {a.portfolioUrl && (
                            <a href={a.portfolioUrl} target="_blank" rel="noreferrer" className="hover:underline">
                              Portfolio
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setExpandedApplicant(expandedApplicant === a._id ? null : a._id)}
                            className="hover:underline"
                          >
                            {expandedApplicant === a._id ? "Hide messages" : "Message"}
                          </button>
                        </div>
                        {expandedApplicant === a._id && (
                          <MessageThread applicationId={a._id} initialMessages={a.messages} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
