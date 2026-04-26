const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const analyzeRoutes = require("./routes/analyze");
const fullAnalyzeRoutes = require("./routes/fullAnalyze");
const reportRoutes = require("./routes/report");
const app = express();
const path = require("path");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api", fullAnalyzeRoutes);
app.use("/api", reportRoutes);
app.use(express.static(path.join(__dirname, "../client")));
// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/resumeDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Test Route
app.get("/", (req, res) => {
    res.send("Server is running...");
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/pages/login.html"));
});
// Server Start
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});