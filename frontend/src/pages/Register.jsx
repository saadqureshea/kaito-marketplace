import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ROLES = [
  { value: "buyer", label: "Buyer", desc: "Shop products & services" },
  { value: "seller", label: "Seller", desc: "List products & services" },
  { value: "worker", label: "Worker", desc: "Find remote work" },
  { value: "employer", label: "Employer", desc: "Post jobs, hire talent" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: params.get("role") || "buyer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="mb-1 font-display text-2xl font-semibold">Join KAITO MarketPlace</h1>
      <p className="mb-8 text-sm text-ink-700/75">Free to join. Sellers and workers keep 80% of every sale.</p>

      <form onSubmit={submit} className="card flex flex-col gap-4 p-6">
        {error && <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium">I want to join as</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  form.role === r.value ? "border-signal-500 bg-signal-500/5" : "border-line"
                }`}
              >
                <span className="block font-medium">{r.label}</span>
                <span className="block text-xs text-ink-700/75">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button disabled={loading} className="btn-primary mt-2 w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-700/75">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-signal-500">
          Log in
        </Link>
      </p>
    </div>
  );
}
