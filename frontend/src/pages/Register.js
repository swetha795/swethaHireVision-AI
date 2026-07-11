import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = ["Software Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "Full Stack Developer"];

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", targetRole: ROLES[0] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.targetRole);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-studio-panel border border-studio-border rounded-xl p-8">
        <h1 className="font-display text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-studio-muted text-sm mb-6">Start practicing with AI-powered mock interviews.</p>

        {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-mono uppercase text-studio-muted">Full name</label>
            <input name="name" required value={form.name} onChange={handleChange}
              className="mt-1 w-full bg-studio-bg border border-studio-border rounded px-3 py-2 outline-none focus:border-amber-signal transition" placeholder="Swetha Kumar" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-studio-muted">Email</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange}
              className="mt-1 w-full bg-studio-bg border border-studio-border rounded px-3 py-2 outline-none focus:border-amber-signal transition" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-studio-muted">Password</label>
            <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange}
              className="mt-1 w-full bg-studio-bg border border-studio-border rounded px-3 py-2 outline-none focus:border-amber-signal transition" placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-studio-muted">Target role</label>
            <select name="targetRole" value={form.targetRole} onChange={handleChange}
              className="mt-1 w-full bg-studio-bg border border-studio-border rounded px-3 py-2 outline-none focus:border-amber-signal transition">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="mt-2 bg-amber-signal text-studio-bg font-semibold rounded py-2 hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-studio-muted mt-6 text-center">
          Already have an account? <Link to="/login" className="text-amber-signal hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
