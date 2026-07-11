import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import Loader from "../components/Loader";
import ScoreCard from "../components/ScoreCard";

const EMOTION_COLORS = { confident: "text-teal-calm", neutral: "text-studio-muted", nervous: "text-red-400", happy: "text-amber-signal" };

const Results = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setInterview(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  if (loading) return <Loader label="Loading results" />;
  if (!interview) return <p className="text-center py-10 text-studio-muted">Interview not found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Interview Results</h1>
      <p className="text-studio-muted text-sm mt-1">{interview.role} · {new Date(interview.createdAt).toLocaleString()}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <ScoreCard label="Overall Score" score={interview.overallScore} accent="amber" />
        <ScoreCard label="Technical" score={interview.technicalScore} accent="teal" />
        <ScoreCard label="Communication" score={interview.communicationScore} accent="teal" />
        <ScoreCard label="Confidence" score={interview.confidenceScore} accent="amber" />
      </div>

      <div className="bg-studio-panel border border-studio-border rounded-lg p-5 mt-6">
        <h2 className="font-display font-semibold mb-3">Personalized Feedback</h2>
        <ul className="space-y-2 text-sm list-disc list-inside">
          {interview.personalizedFeedback.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>

      <h2 className="font-display font-semibold mt-8 mb-3">Question-by-Question Breakdown</h2>
      <div className="flex flex-col gap-3">
        {interview.answers.map((a, i) => (
          <div key={i} className="bg-studio-panel border border-studio-border rounded-lg p-5">
            <div className="flex justify-between items-start gap-4">
              <p className="font-medium">{i + 1}. {a.question}</p>
              <span className="font-mono text-sm text-amber-signal whitespace-nowrap">{a.answerScore}/100</span>
            </div>
            <p className="text-sm text-studio-muted mt-2">{a.userAnswerText}</p>
            <div className="flex items-center gap-3 mt-3 text-xs font-mono">
              <span className={EMOTION_COLORS[a.dominantEmotion] || "text-studio-muted"}>
                Dominant emotion: {a.dominantEmotion}
              </span>
            </div>
            <p className="text-xs text-studio-muted mt-2 italic">{a.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;
