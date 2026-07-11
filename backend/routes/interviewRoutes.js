const express = require("express");
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewById,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/auth");

router.post("/start", protect, startInterview);
router.post("/:id/answer", protect, submitAnswer);
router.post("/:id/complete", protect, completeInterview);
router.get("/history", protect, getInterviewHistory);
router.get("/:id", protect, getInterviewById);

module.exports = router;
