// Handles resume upload and delegates parsing/analysis to the Python AI service
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const Resume = require("../models/Resume");

// @route POST /api/resume/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file uploaded" });
    }

    // Forward the file to the Python AI service for text extraction + NLP analysis
    const form = new FormData();
    form.append("resume", fs.createReadStream(req.file.path));
    form.append("targetRole", req.body.targetRole || req.user.targetRole);

    let analysis;
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/analyze-resume`,
        form,
        { headers: form.getHeaders(), timeout: 30000 }
      );
      analysis = aiResponse.data;
    } catch (aiError) {
      console.error("AI service error:", aiError.message);
      return res.status(502).json({
        success: false,
        message: "Resume analysis service is unavailable. Make sure the Python AI service is running on port 5001.",
      });
    }

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      rawText: analysis.rawText,
      skills: analysis.skills,
      detectedRole: analysis.detectedRole,
      experienceYears: analysis.experienceYears,
      atsScore: analysis.atsScore,
      strengths: analysis.strengths,
      improvementAreas: analysis.improvementAreas,
      keywordMatch: analysis.keywordMatch,
    });

    res.status(201).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/resume/my-resumes
const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/resume/:id
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadResume, getMyResumes, getResumeById };
