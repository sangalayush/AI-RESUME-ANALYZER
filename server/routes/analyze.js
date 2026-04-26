const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");

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

router.post("/resume", async (req, res) => {
  try {
    const { job_desc, filePath } = req.body;

    if (!job_desc || !filePath) {
      return res.status(400).json({ error: "job_desc and filePath are required" });
    }

    const resume_text = await extractTextFromPDF(filePath);

    const response = await axios.post("http://127.0.0.1:6000/analyze", {
      resume_text: resume_text,
      job_desc: job_desc
    });

    const aiResult = response.data;

return res.json({
  message: "Resume analyzed successfully",
  match_score: aiResult.match_score,
  matched_skills: aiResult.matched_skills,
  missing_skills: aiResult.missing_skills,
  suggestions: aiResult.suggestions
});

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;