import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-studio-border bg-studio-panel/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg tracking-tight">
          <span className="on-air-dot"></span>
          HireVision <span className="text-amber-signal">AI</span>
        </Link>

        {user && (
          <div className="flex items-center gap-6 text-sm font-mono">
            <Link to="/dashboard" className="text-studio-muted hover:text-studio-text transition">Dashboard</Link>
            <Link to="/resume" className="text-studio-muted hover:text-studio-text transition">Resume</Link>
            <Link to="/interview" className="text-studio-muted hover:text-studio-text transition">Mock Interview</Link>
            <Link to="/analytics" className="text-studio-muted hover:text-studio-text transition">Analytics</Link>
            <button
              onClick={handleLogout}
              className="text-studio-muted hover:text-amber-signal transition border border-studio-border rounded px-3 py-1"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
