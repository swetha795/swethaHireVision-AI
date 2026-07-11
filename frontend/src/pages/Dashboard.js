import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const Dashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interviewRes, resumeRes] = await Promise.all([
          api.get("/interview/history"),
          api.get("/resume/my-resumes"),
        ]);
        setInterviews(interviewRes.data.data);
        setResumes(resumeRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completed = interviews.filter((i) => i.status === "completed");
  const avgScore = completed.length
    ? Math.round(completed.reduce((sum, i) => sum + i.overallScore, 0) / completed.length)
    : 0;

  if (loading) return <Loader label="Loading dashboard" />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Welcome, {user?.name?.split(" ")[0]}</h1>
      <p className="text-studio-muted text-sm mt-1">Preparing for: <span className="text-amber-signal">{user?.targetRole}</span></p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
          <span className="text-xs font-mono uppercase text-studio-muted">Interviews Completed</span>
          <div className="text-3xl font-display font-semibold mt-1">{completed.length}</div>
        </div>
        <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
          <span className="text-xs font-mono uppercase text-studio-muted">Average Score</span>
          <div className="text-3xl font-display font-semibold mt-1 text-amber-signal">{avgScore}</div>
        </div>
        <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
          <span className="text-xs font-mono uppercase text-studio-muted">Resumes Analyzed</span>
          <div className="text-3xl font-display font-semibold mt-1">{resumes.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Link to="/resume" className="bg-studio-panel border border-studio-border rounded-lg p-6 hover:border-amber-signal transition group">
          <h3 className="font-display font-semibold text-lg group-hover:text-amber-signal transition">Analyze a Resume</h3>
          <p className="text-studio-muted text-sm mt-1">Upload your resume for ATS scoring and keyword matching.</p>
        </Link>
        <Link to="/interview" className="bg-studio-panel border border-studio-border rounded-lg p-6 hover:border-amber-signal transition group">
          <h3 className="font-display font-semibold text-lg group-hover:text-amber-signal transition">Start Mock Interview</h3>
          <p className="text-studio-muted text-sm mt-1">Practice with AI-driven questions, emotion tracking, and scoring.</p>
        </Link>
      </div>

      <h2 className="font-display text-lg font-semibold mt-10 mb-4">Recent Interviews</h2>
      {interviews.length === 0 ? (
        <p className="text-studio-muted text-sm">No interviews yet — start one to see your history here.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {interviews.slice(0, 5).map((i) => (
            <Link key={i._id} to={`/results/${i._id}`} className="flex justify-between items-center bg-studio-panel border border-studio-border rounded-lg px-5 py-3 hover:border-amber-signal transition">
              <div>
                <span className="font-medium">{i.role}</span>
                <span className="text-studio-muted text-xs font-mono ml-3">{new Date(i.createdAt).toLocaleDateString()}</span>
              </div>
              <span className={`font-mono text-sm ${i.status === "completed" ? "text-teal-calm" : "text-studio-muted"}`}>
                {i.status === "completed" ? `${i.overallScore}/100` : "In progress"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
