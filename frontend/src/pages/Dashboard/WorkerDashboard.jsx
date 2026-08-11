import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import MessageThread from "../../components/MessageThread.jsx";

export default function WorkerDashboard() {
  const { user, refresh } = useAuth();
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(user?.professionalProfile || {});
  const [expandedApp, setExpandedApp] = useState(null);

  useEffect(() => {
    api.get("/jobs/applications/mine").then(({ data }) => setApplications(data));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    await api.put("/auth/profile", { professionalProfile: profile });
    await refresh();
    alert("Profile submitted for review.");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold">Worker Dashboard</h1>

      <div className="mb-8 card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Professional Profile</h2>
          <span className="rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            {user?.professionalProfile?.approvalStatus?.replace("_", " ")}
          </span>
        </div>
        <form onSubmit={saveProfile} className="flex flex-col gap-3">
          <input
            className="input"
            placeholder="Headline (e.g. Full-Stack Developer)"
            value={profile.headline || ""}
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
          />
          <input
            className="input"
            placeholder="CV URL"
            value={profile.cvUrl || ""}
            onChange={(e) => setProfile({ ...profile, cvUrl: e.target.value })}
          />
          <input
            className="input"
            placeholder="Portfolio URL"
            value={profile.portfolioUrl || ""}
            onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
          />
          <button className="btn-primary w-fit">Submit for review</button>
        </form>
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold">My Applications</h2>
      <div className="card divide-y divide-line">
        {applications.length === 0 ? (
          <p className="p-6 text-sm text-ink-700/75">No applications yet.</p>
        ) : (
          applications.map((a) => (
            <div key={a._id}>
              <button
                onClick={() => setExpandedApp(expandedApp === a._id ? null : a._id)}
                className="flex w-full items-center justify-between p-4 text-left text-sm"
              >
                <span>{a.job?.title}</span>
                <span className="text-ink-700/75">{a.status}</span>
              </button>
              {expandedApp === a._id && (
                <div className="bg-paper-50 px-4 pb-4">
                  <MessageThread applicationId={a._id} initialMessages={a.messages} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
