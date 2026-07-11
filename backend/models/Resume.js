// Resume schema - stores uploaded resume + parsed analysis results
const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    rawText: { type: String }, // extracted text from PDF/DOC
    skills: [{ type: String }],
    detectedRole: { type: String },
    experienceYears: { type: Number, default: 0 },
    atsScore: { type: Number, min: 0, max: 100, default: 0 },
    strengths: [{ type: String }],
    improvementAreas: [{ type: String }],
    keywordMatch: { type: Number, min: 0, max: 100, default: 0 }, // match % vs target role
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
