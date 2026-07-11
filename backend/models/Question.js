// Question bank schema - stores interview questions by role/category
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    category: {
      type: String,
      enum: ["technical", "behavioral", "hr", "situational"],
      default: "technical",
    },
    role: { type: String, default: "General" }, // e.g. "Frontend Developer"
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
