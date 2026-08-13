import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", subject: "", message: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send your message - please try again");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-signal-500/10 text-signal-500">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold">Message sent</h1>
        <p className="mt-2 text-sm text-ink-700/75">
          Thanks for reaching out - your message has been received and a member of the team will follow up.
        </p>
        <Link to="/" className="btn-secondary mt-6 inline-flex">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-wider text-signal-500">Contact Us</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink-950">Get in touch</h1>
      <p className="mt-2 text-sm text-ink-700/75">
        Order or account issue? Check the Help Center first - most questions there resolve faster
        than a message. Otherwise, send us a note below.
      </p>

      <form onSubmit={submit} className="card mt-6 flex flex-col gap-4 p-6">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            required
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Subject</label>
          <input
            required
            className="input"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Message</label>
          <textarea
            required
            minLength={10}
            rows={5}
            className="input"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading} className="press btn-primary">
          {loading ? "Sending..." : "Send message"}
        </button>
      </form>
    </div>
  );
}
