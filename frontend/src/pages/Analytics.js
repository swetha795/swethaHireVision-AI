import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../utils/api";
import Loader from "../components/Loader";

const Analytics = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/interview/history");
        setInterviews(res.data.data.filter((i) => i.status === "completed").reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader label="Loading analytics" />;

  const chartData = interviews.map((i, idx) => ({
    name: `#${idx + 1}`,
    Overall: i.overallScore,
    Technical: i.technicalScore,
    Confidence: i.confidenceScore,
  }));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Progress Analytics</h1>
      <p className="text-studio-muted text-sm mt-1">Track how your interview performance improves over time.</p>

      {interviews.length === 0 ? (
        <p className="text-studio-muted text-sm mt-8">Complete at least one interview to see your progress chart.</p>
      ) : (
        <div className="bg-studio-panel border border-studio-border rounded-lg p-6 mt-6" style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis dataKey="name" stroke="#8b8d9c" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#8b8d9c" fontSize={12} />
              <Tooltip contentStyle={{ background: "#191b24", border: "1px solid #2a2d3a", borderRadius: 8 }} />
              <Line type="monotone" dataKey="Overall" stroke="#ffb020" strokeWidth={2} />
              <Line type="monotone" dataKey="Technical" stroke="#3fd6c5" strokeWidth={2} />
              <Line type="monotone" dataKey="Confidence" stroke="#e9e9ee" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;
