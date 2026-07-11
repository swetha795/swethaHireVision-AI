const express = require("express");
const router = express.Router();
const { uploadResume, getMyResumes, getResumeById } = require("../controllers/resumeController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/my-resumes", protect, getMyResumes);
router.get("/:id", protect, getResumeById);

module.exports = router;
