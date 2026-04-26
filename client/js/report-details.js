async function fetchReportDetails() {
  const token = localStorage.getItem("token");
  const reportDetails = document.getElementById("reportDetails");

  if (!token) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const reportId = params.get("id");

  if (!reportId) {
    reportDetails.innerHTML = "<p style='color:red;'>Report ID missing!</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
      method: "GET",
      headers: {
        Authorization: token
      }
    });

    const data = await response.json();

    if (response.ok) {
      const report = data.report;
      
      const matched = report.matchedSkills || [];
      const missing = report.missingSkills || [];

      reportDetails.innerHTML = `
        <h2>Match Score: ${report.matchScore}%</h2>
        <p><b>Date:</b> ${new Date(report.createdAt).toLocaleString()}</p>

        <hr>

        <h3>Job Description</h3>
        <p style="white-space: pre-line;">${report.jobDescription}</p>

        <hr>

        <h3>Matched Skills</h3>
        <p>${matched.length ? matched.join(", ") : "None"}</p>

        <h3>Missing Skills</h3>
        <p>${missing.length ? missing.join(", ") : "None"}</p>

        <hr>

        <h3>Suggestions</h3>
        <p>${report.suggestions || "No suggestion available"}</p>

        <br>

        <button class="btn btn-success" onclick="downloadPDF('${report._id}')">
          Download PDF
        </button>
      `;
    } else {
      reportDetails.innerHTML = `<p style="color:red;">${data.message || "Report not found"}</p>`;
    }
  } catch (error) {
    reportDetails.innerHTML = `<p style="color:red;">Server not responding!</p>`;
  }
}

function goBack() {
  window.location.href = "reports.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

function downloadPDF(reportId) {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:5000/api/reports/${reportId}/download`, {
    method: "GET",
    headers: { Authorization: token }
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(() => alert("Download failed!"));
}

fetchReportDetails();