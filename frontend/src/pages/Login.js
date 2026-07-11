import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-studio-panel border border-studio-border rounded-xl p-8">
        <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-studio-muted text-sm mb-6">Sign in to continue your interview prep.</p>

        {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-mono uppercase text-studio-muted">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-studio-bg border border-studio-border rounded px-3 py-2 outline-none focus:border-amber-signal transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-studio-muted">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-studio-bg border border-studio-border rounded px-3 py-2 outline-none focus:border-amber-signal transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="mt-2 bg-amber-signal text-studio-bg font-semibold rounded py-2 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-studio-muted mt-6 text-center">
          Don't have an account? <Link to="/register" className="text-amber-signal hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
