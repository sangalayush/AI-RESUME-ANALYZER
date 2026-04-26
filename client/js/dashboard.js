console.log("PAGE LOADED AT:", new Date().toLocaleTimeString());
console.log("dashboard.js file loaded successfully");
const API_BASE_URL = window.location.origin;
async function uploadAndAnalyze() {
  const token = localStorage.getItem("token");
  const job_desc = document.getElementById("job_desc").value;
  const resumeFile = document.getElementById("resumeFile").files[0];
  const resultMsg = document.getElementById("resultMsg");
  const loaderBox = document.getElementById("loaderBox");
  const progressBar = document.getElementById("progressBar");
const loadingText = document.getElementById("loadingText");

const successPopup = document.getElementById("successPopup");
const popupScore = document.getElementById("popupScore");
const successSound = document.getElementById("successSound");
  if (!token) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  if (!job_desc || !resumeFile) {
    resultMsg.style.color = "red";
    resultMsg.innerText = "Please upload resume and enter job description!";
    return;
  }

  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("job_desc", job_desc);

  loaderBox.style.display = "block";
  resultMsg.innerHTML = "";

  let progress = 0;
progressBar.style.width = "0%";
loadingText.innerText = "Uploading Resume...";

const progressInterval = setInterval(() => {
  if (progress < 90) {
    progress += 10;
    progressBar.style.width = progress + "%";

    if (progress < 40) loadingText.innerText = "Uploading Resume...";
    else if (progress < 70) loadingText.innerText = "Extracting Resume Text...";
    else loadingText.innerText = "AI Analyzing Resume...";
  }
}, 500);
  try {
    const response = await fetch(`${API_BASE_URL}/api/full-analyze`, {
      method: "POST",
      headers: {
        Authorization: token
      },
      body: formData
    });

    const data = await response.json();

    clearInterval(progressInterval);
progressBar.style.width = "100%";
loadingText.innerText = "Finalizing...";

    loaderBox.style.display = "none";
    setTimeout(() => {
  progressBar.style.width = "0%";
}, 500);

    if (response.ok) {
      resultMsg.style.color = "green";
      resultMsg.innerHTML = `
        <h3>Match Score: ${data.match_score}%</h3>
        <p><b>Matched Skills:</b> ${(data.matched_skills && data.matched_skills.length) ? data.matched_skills.join(", ") : "None"}</p>
        <p><b>Missing Skills:</b> ${(data.missing_skills && data.missing_skills.length) ? data.missing_skills.join(", ") : "None"}</p>
        <p><b>Suggestions:</b> ${data.suggestions || "No suggestions available"}</p>
      `;
      popupScore.innerText = "Match Score: " + data.match_score + "%";
successPopup.style.display = "flex";

try {
  successSound.play();
} catch (e) {
  console.log("Sound blocked by browser");
}
    } else {
      resultMsg.style.color = "red";
      resultMsg.innerText = data.error || "Something went wrong!";
    }

  } catch (error) {
    loaderBox.style.display = "none";
    resultMsg.style.color = "red";
    resultMsg.innerText = "Server not responding!";
    clearInterval(progressInterval);
progressBar.style.width = "0%";
  }
}
function closePopup() {
  document.getElementById("successPopup").style.display = "none";
}
function goToReports() {
  window.location.href = "./reports.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
}

function logout() {
  localStorage.removeItem("token");
}

async function loadDashboardStats() {
  const token = localStorage.getItem("token");
  const stats = document.getElementById("stats");

  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: "GET",
      headers: { "Authorization": token }
    });

    const data = await response.json();

    if (response.ok) {
      if (data.reports.length === 0) {
        stats.innerText = "No reports available yet.";
        document.getElementById("totalReports").innerText = "0";
        document.getElementById("latestScore").innerText = "0%";
      } else {
        const latest = data.reports[0];

        document.getElementById("totalReports").innerText = data.reports.length;
        document.getElementById("latestScore").innerText = latest.matchScore + "%";

        stats.innerText = "Last Report Date: " + new Date(latest.createdAt).toLocaleString();
      }
    } else {
      stats.innerText = "Unable to load stats.";
    }

  } catch (error) {
    stats.innerText = "Server not responding.";
  }
}
function goToReports() {
  window.location.href = "./reports.html";
}
function logout() {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
}
loadDashboardStats();

loadDashboardStats();
let scoreChartInstance = null;

async function loadScoreChart() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: "GET",
      headers: { "Authorization": token }
    });

    const data = await response.json();
    if (!response.ok) return;

    const reports = data.reports;
    if (reports.length === 0) return;

    const labels = reports.map((r) =>
      new Date(r.createdAt).toLocaleDateString()
    ).reverse();

    const scores = reports.map((r) => r.matchScore).reverse();

    const canvas = document.getElementById("scoreChart");
    const ctx = canvas.getContext("2d");

    if (scoreChartInstance) {
      scoreChartInstance.destroy();
    }

    scoreChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Match Score (%)",
            data: scores,
            borderWidth: 2,
            fill: false
          }
        ]
      }
    });

  } catch (error) {
    console.log("Chart error:", error);
  }
}

loadScoreChart();
document.getElementById("uploadBtn").addEventListener("click", uploadAndAnalyze);