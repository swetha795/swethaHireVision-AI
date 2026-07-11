import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const ROLES = ["Software Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "Full Stack Developer"];

const MockInterview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const captureIntervalRef = useRef(null);

  const [stage, setStage] = useState("setup"); // setup | interview | submitting
  const [role, setRole] = useState(user?.targetRole || ROLES[0]);
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [frames, setFrames] = useState([]);
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startInterview = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/interview/start", { role, numQuestions: 5 });
      setInterviewId(res.data.data.interviewId);
      setQuestions(res.data.data.questions);
      setStage("interview");
    } catch (err) {
      setError(err.response?.data?.message || "Could not start interview.");
    } finally {
      setLoading(false);
    }
  };

  // Capture a webcam frame every 2 seconds while answering (for emotion analysis)
  const beginCapture = useCallback(() => {
    setFrames([]);
    if (!webcamEnabled) return;
    captureIntervalRef.current = setInterval(() => {
      if (webcamRef.current) {
        const shot = webcamRef.current.getScreenshot();
        if (shot) setFrames((prev) => [...prev, shot]);
      }
    }, 2000);
  }, [webcamEnabled]);

  const stopCapture = () => {
    if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
  };

  React.useEffect(() => {
    if (stage === "interview") beginCapture();
    return () => stopCapture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, currentIndex]);

  const submitCurrentAnswer = async () => {
    stopCapture();
    setLoading(true);
    setError("");
    const q = questions[currentIndex];

    try {
      await api.post(`/interview/${interviewId}/answer`, {
        question: q.text,
        category: q.category,
        userAnswerText: answerText,
        emotionFrames: frames,
      });

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setAnswerText("");
      } else {
        const completeRes = await api.post(`/interview/${interviewId}/complete`);
        navigate(`/results/${completeRes.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit answer.");
    } finally {
      setLoading(false);
    }
  };

  if (stage === "setup") {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">Start a Mock Interview</h1>
        <p className="text-studio-muted text-sm mt-1">Choose a role — you'll get 5 tailored questions with live emotion tracking.</p>

        <div className="bg-studio-panel border border-studio-border rounded-lg p-6 mt-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-mono uppercase text-studio-muted">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full bg-studio-bg border border-studio-border rounded px-3 py-2 outline-none focus:border-amber-signal transition">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-studio-muted">
            <input type="checkbox" checked={webcamEnabled} onChange={(e) => setWebcamEnabled(e.target.checked)} />
            Enable webcam for emotion & confidence detection
          </label>

          {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded p-3">{error}</div>}

          <button onClick={startInterview} disabled={loading}
            className="bg-amber-signal text-studio-bg font-semibold rounded py-2 hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Preparing questions..." : "Begin Interview"}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold flex items-center gap-2">
          <span className="on-air-dot"></span> Question {currentIndex + 1} of {questions.length}
        </h1>
        <span className="text-xs font-mono text-studio-muted uppercase">{q.category}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {webcamEnabled ? (
            <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg"
              className="rounded-lg border border-studio-border w-full aspect-video object-cover" />
          ) : (
            <div className="rounded-lg border border-studio-border w-full aspect-video flex items-center justify-center text-studio-muted text-sm">
              Webcam disabled
            </div>
          )}
          <p className="text-xs text-studio-muted font-mono mt-2">Capturing frames every 2s for confidence analysis · {frames.length} captured</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
            <p className="text-lg font-medium">{q.text}</p>
          </div>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your answer here (or speak while recording, then summarize your answer in text)..."
            rows={8}
            className="bg-studio-bg border border-studio-border rounded-lg p-4 outline-none focus:border-amber-signal transition resize-none"
          />

          {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded p-3">{error}</div>}

          <button onClick={submitCurrentAnswer} disabled={loading || !answerText.trim()}
            className="bg-amber-signal text-studio-bg font-semibold rounded py-2 hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Submitting..." : currentIndex + 1 === questions.length ? "Finish Interview" : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
