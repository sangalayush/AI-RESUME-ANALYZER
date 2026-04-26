const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  resumeFile: String,
  jobDescription: String,

  matchScore: Number,
  matchedSkills: [String],
  missingSkills: [String],
  suggestions: String,

  candidateInfo: {
  email: String,
  phone: String,
  linkedin: String,
  github: String
},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);