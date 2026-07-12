// Run with `npm run seed` to populate the database with sample interview questions
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Question = require("../models/Question");

const questions = [
  // General
  { text: "Tell me about yourself.", category: "hr", role: "General", difficulty: "easy" },
  { text: "Why do you want to work at our company?", category: "hr", role: "General", difficulty: "easy" },
  { text: "Where do you see yourself in five years?", category: "hr", role: "General", difficulty: "easy" },
  { text: "Describe a time you faced conflict in a team and how you resolved it.", category: "behavioral", role: "General", difficulty: "medium" },
  { text: "Tell me about a time you failed and what you learned from it.", category: "behavioral", role: "General", difficulty: "medium" },

  // Software Engineer
  { text: "Explain the difference between an array and a linked list.", category: "technical", role: "Software Engineer", difficulty: "easy" },
  { text: "What is the time complexity of binary search and why?", category: "technical", role: "Software Engineer", difficulty: "medium" },
  { text: "How would you design a URL shortening service?", category: "technical", role: "Software Engineer", difficulty: "hard" },
  { text: "Explain the concept of RESTful APIs.", category: "technical", role: "Software Engineer", difficulty: "medium" },
  { text: "What is the difference between SQL and NoSQL databases?", category: "technical", role: "Software Engineer", difficulty: "medium" },

  // Frontend Developer
  { text: "What is the virtual DOM and how does React use it?", category: "technical", role: "Frontend Developer", difficulty: "medium" },
  { text: "Explain the difference between CSS Grid and Flexbox.", category: "technical", role: "Frontend Developer", difficulty: "easy" },
  { text: "How do you optimize the performance of a React application?", category: "technical", role: "Frontend Developer", difficulty: "hard" },

  // Data Analyst
  { text: "How would you handle missing data in a dataset?", category: "technical", role: "Data Analyst", difficulty: "medium" },
  { text: "Explain the difference between correlation and causation.", category: "technical", role: "Data Analyst", difficulty: "medium" },

  // Situational
  { text: "How would you handle a tight deadline with incomplete requirements?", category: "situational", role: "General", difficulty: "medium" },
];

const seedDB = async () => {
  try {
    await connectDB();
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log(`Seeded ${questions.length} questions successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}
module.exports = { questions };
