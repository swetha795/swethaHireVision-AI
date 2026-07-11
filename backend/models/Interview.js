// Interview schema - stores a full mock interview session with per-question results
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String },
    userAnswerText: { type: String }, // transcribed / typed answer
    answerScore: { type: Number, min: 0, max: 100, default: 0 },
    dominantEmotion: { type: String, default: "neutral" }, // from emotion detection service
    emotionBreakdown: {
      confident: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      nervous: { type: Number, default: 0 },
      happy: { type: Number, default: 0 },
    },
    feedback: { type: String },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true }, // role being interviewed for
    answers: [answerSchema],
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    communicationScore: { type: Number, min: 0, max: 100, default: 0 },
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    technicalScore: { type: Number, min: 0, max: 100, default: 0 },
    personalizedFeedback: [{ type: String }],
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
