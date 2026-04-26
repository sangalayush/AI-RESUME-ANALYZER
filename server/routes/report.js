const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const authMiddleware = require("../middleware/authMiddleware");
const PDFDocument = require("pdfkit");

// ✅ Get all reports of logged-in user
router.get("/reports", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    return res.json({
      message: "Reports fetched successfully",
      reports: reports,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ✅ Get single report by ID
router.get("/reports/:id", authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.json({
      message: "Report fetched successfully",
      report: report,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ✅ Delete report by ID
router.delete("/reports/:id", authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// ✅ Download report as PDF
router.get("/reports/:id/download", authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${report._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text("AI Resume Analyzer Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Report ID: ${report._id}`);
    doc.text(`Date: ${new Date(report.createdAt).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text(`Match Score: ${report.matchScore}%`);
    doc.moveDown();

    doc.fontSize(12).text("Job Description:", { underline: true });
    doc.text(report.jobDescription);
    doc.moveDown();

    doc.text("Matched Skills:", { underline: true });
    doc.text(
      report.matchedSkills && report.matchedSkills.length > 0
        ? report.matchedSkills.join(", ")
        : "None"
    );
    doc.moveDown();

    doc.text("Missing Skills:", { underline: true });
    doc.text(
      report.missingSkills && report.missingSkills.length > 0
        ? report.missingSkills.join(", ")
        : "None"
    );
    doc.moveDown();

    doc.text("Suggestions:", { underline: true });
    doc.text(report.suggestions || "No suggestions available");
    doc.moveDown();

    doc.end();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
module.exports = router;
