// Handles mock interview sessions: question generation, answer submission,
// emotion-aware scoring (via Python AI service), and personalized feedback.
const axios = require("axios");
const Interview = require("../models/Interview");
const Question = require("../models/Question");

// @route POST /api/interview/start
// Creates a new interview session and returns a set of questions for the role
const startInterview = async (req, res) => {
  try {
    const { role, numQuestions = 5 } = req.body;
    if (!role) return res.status(400).json({ success: false, message: "Role is required" });

    // Pull role-specific questions; fall back to general ones if not enough exist
    let questions = await Question.find({ role }).limit(numQuestions);
    if (questions.length < numQuestions) {
      const extra = await Question.find({ role: "General" }).limit(numQuestions - questions.length);
      questions = questions.concat(extra);
    }

    const interview = await Interview.create({
      user: req.user._id,
      role,
      answers: [],
      status: "in-progress",
    });

    res.status(201).json({
      success: true,
      data: {
        interviewId: interview._id,
        questions: questions.map((q) => ({ id: q._id, text: q.text, category: q.category })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/interview/:id/answer
// Submits one answer (text + optional captured emotion frames) for scoring
const submitAnswer = async (req, res) => {
  try {
    const { question, category, userAnswerText, emotionFrames } = req.body;
    // emotionFrames: array of base64 snapshots captured from webcam during the answer (optional)

    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });

    let emotionResult = { dominantEmotion: "neutral", breakdown: { confident: 0, neutral: 100, nervous: 0, happy: 0 } };
    let answerScoreResult = { score: 60, feedback: "Answer recorded." };

    // Call Python AI service for emotion analysis (if frames provided) and answer scoring
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/analyze-answer`, {
        question,
        answerText: userAnswerText,
        emotionFrames: emotionFrames || [],
      }, { timeout: 30000 });

      emotionResult = aiResponse.data.emotion;
      answerScoreResult = aiResponse.data.scoring;
    } catch (aiError) {
      console.error("AI service unavailable for answer analysis:", aiError.message);
      // Continue gracefully with default/fallback scoring so the interview isn't blocked
    }

    interview.answers.push({
      question,
      category,
      userAnswerText,
      answerScore: answerScoreResult.score,
      dominantEmotion: emotionResult.dominantEmotion,
      emotionBreakdown: emotionResult.breakdown,
      feedback: answerScoreResult.feedback,
    });

    await interview.save();
    res.json({ success: true, data: interview.answers[interview.answers.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/interview/:id/complete
// Finalizes the interview, computes aggregate scores and personalized feedback
const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    if (interview.answers.length === 0) {
      return res.status(400).json({ success: false, message: "Cannot complete an interview with no answers" });
    }

    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const technicalScore = Math.round(
      avg(interview.answers.filter((a) => a.category === "technical").map((a) => a.answerScore)) || avg(interview.answers.map((a) => a.answerScore))
    );

    // Confidence score derived from emotion breakdowns across all answers
    const confidenceScore = Math.round(
      avg(interview.answers.map((a) => (a.emotionBreakdown?.confident || 0) - (a.emotionBreakdown?.nervous || 0) * 0.5 + 50))
    );

    const communicationScore = Math.round(avg(interview.answers.map((a) => a.answerScore)));

    const overallScore = Math.round(
      technicalScore * 0.4 + communicationScore * 0.35 + Math.min(confidenceScore, 100) * 0.25
    );

    // Generate simple rule-based personalized feedback (no extra AI call needed)
    const feedback = [];
    if (confidenceScore < 50) feedback.push("Try to maintain steadier eye contact and a calmer tone to project more confidence.");
    if (technicalScore < 60) feedback.push("Strengthen technical depth — review core concepts related to the role and practice explaining them concisely.");
    if (communicationScore < 60) feedback.push("Work on structuring answers using a clear framework (e.g. STAR method for behavioral questions).");
    if (overallScore >= 80) feedback.push("Strong overall performance — you're interview-ready for this role.");
    if (feedback.length === 0) feedback.push("Solid performance across the board. Keep practicing to build consistency.");

    interview.technicalScore = technicalScore;
    interview.confidenceScore = Math.max(0, Math.min(100, confidenceScore));
    interview.communicationScore = communicationScore;
    interview.overallScore = overallScore;
    interview.personalizedFeedback = feedback;
    interview.status = "completed";

    await interview.save();
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/interview/history
const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/interview/:id
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startInterview, submitAnswer, completeInterview, getInterviewHistory, getInterviewById };
