const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const authMiddleware = require("../middleware/authMiddleware");
const Report = require("../models/Report");
const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:6000";

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// PDF Text Extract Function
async function extractTextFromPDF(filePath) {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    text += pageText + "\n";
  }

  return text;
}

// Full Analyze API (Protected)
router.post(
  "/full-analyze",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      const job_desc = req.body.job_desc;

      if (!req.file) {
        return res.status(400).json({ error: "Resume file is required" });
      }

      if (!job_desc) {
        return res.status(400).json({ error: "Job description is required" });
      }

      const filePath = req.file.path;

      // Extract resume text
      const resume_text = await extractTextFromPDF(filePath);

      // Call Flask AI service
      const response = await axios.post(`${aiServiceUrl}/analyze`, {
        resume_text: resume_text,
        job_desc: job_desc,
      });

      const matchScore = response.data.match_score;

      // Save report in MongoDB
    const report = new Report({
  userId: req.user.id,
  resumeFile: filePath,
  jobDescription: job_desc,
  matchScore: response.data.match_score,
  matchedSkills: response.data.matched_skills,
  missingSkills: response.data.missing_skills,
  suggestions: response.data.suggestions
});

      await report.save();

      return res.json({
        message: "Resume uploaded and analyzed successfully",
        match_score: response.data.match_score,
        matched_skills: response.data.matched_skills,
        missing_skills: response.data.missing_skills,
        suggestions: response.data.suggestions,
        reportId: report._id,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
