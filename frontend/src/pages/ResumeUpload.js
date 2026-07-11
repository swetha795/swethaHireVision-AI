import React, { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const ResumeUpload = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState(user?.targetRole || "Software Engineer");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a resume file first.");
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole);

    try {
      const res = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysis(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Resume analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Resume Analysis</h1>
      <p className="text-studio-muted text-sm mt-1">Upload a PDF or DOCX resume for AI-powered ATS scoring and feedback.</p>

      <form onSubmit={handleSubmit} className="bg-studio-panel border border-studio-border rounded-lg p-6 mt-6 flex flex-col gap-4">
        <div>
          <label className="text-xs font-mono uppercase text-studio-muted">Target role</label>
          <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
            className="mt-1 w-full bg-studio-bg border border-studio-border rounded px-3 py-2 outline-none focus:border-amber-signal transition">
            {["Software Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "Full Stack Developer"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-mono uppercase text-studio-muted">Resume file (PDF / DOCX, max 5MB)</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])}
            className="mt-1 w-full text-sm text-studio-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-amber-signal file:text-studio-bg file:font-semibold file:cursor-pointer" />
        </div>

        {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded p-3">{error}</div>}

        <button type="submit" disabled={loading}
          className="bg-amber-signal text-studio-bg font-semibold rounded py-2 hover:opacity-90 transition disabled:opacity-50">
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>

      {loading && <Loader label="Running NLP analysis" />}

      {analysis && (
        <div className="mt-8 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
              <span className="text-xs font-mono uppercase text-studio-muted">ATS Score</span>
              <div className="text-3xl font-display font-semibold text-amber-signal mt-1">{analysis.atsScore}/100</div>
            </div>
            <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
              <span className="text-xs font-mono uppercase text-studio-muted">Role Keyword Match</span>
              <div className="text-3xl font-display font-semibold text-teal-calm mt-1">{analysis.keywordMatch}%</div>
            </div>
          </div>

          <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
            <span className="text-xs font-mono uppercase text-studio-muted">Detected Skills</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {analysis.skills.length ? analysis.skills.map((s) => (
                <span key={s} className="text-xs font-mono bg-studio-bg border border-studio-border rounded-full px-3 py-1">{s}</span>
              )) : <span className="text-studio-muted text-sm">No specific skills detected.</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
              <span className="text-xs font-mono uppercase text-teal-calm">Strengths</span>
              <ul className="mt-2 text-sm space-y-2 list-disc list-inside text-studio-text">
                {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
              <span className="text-xs font-mono uppercase text-amber-signal">Improvement Areas</span>
              <ul className="mt-2 text-sm space-y-2 list-disc list-inside text-studio-text">
                {analysis.improvementAreas.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
