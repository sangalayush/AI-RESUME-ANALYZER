let allReports = [];
async function fetchReports() {
  const token = localStorage.getItem("token");
  const reportsList = document.getElementById("reportsList");

  if (!token) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/reports", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const data = await response.json();

    if (response.ok) {
      reportsList.innerHTML = "";

      if (data.reports.length === 0) {
        reportsList.innerHTML = "<p>No reports found.</p>";
        return;
      }

      allReports = data.reports;
      renderReports(allReports);
      const matched = report.matchedSkills || [];
      const missing = report.missingSkills || [];

      reportsList.innerHTML += `
  <div class="report-card">
    <h3>Match Score: ${report.matchScore}%</h3>

    <p><b>Date:</b> ${new Date(report.createdAt).toLocaleString()}</p>

    <p><b>Job Description:</b> ${report.jobDescription}</p>

    <p><b>Matched Skills:</b> ${matched.length ? matched.join(", ") : "None"}</p>

    <p><b>Missing Skills:</b> ${missing.length ? missing.join(", ") : "None"}</p>

    <p><b>Suggestions:</b> ${report.suggestions || "No suggestion available"}</p>

    <div class="report-buttons">
  <button class="btn btn-primary" onclick="viewDetails('${report._id}')">View Details</button>
  <button class="btn btn-success" onclick="downloadPDF('${report._id}')">Download PDF</button>
  <button class="btn btn-danger" onclick="deleteReport('${report._id}')">Delete</button>
</div>
  </div>
`;
    } else {
      reportsList.innerHTML = `<p style="color:red;">${data.message || "Error fetching reports"}</p>`;
    }
  } catch (error) {
    reportsList.innerHTML = `<p style="color:red;">Server not responding!</p>`;
  }
}

function renderReports(reports) {
  const reportsList = document.getElementById("reportsList");
  reportsList.innerHTML = "";

  if (reports.length === 0) {
    reportsList.innerHTML = "<p>No reports found.</p>";
    return;
  }

  reports.forEach((report) => {
    const matched = report.matchedSkills || [];
    const missing = report.missingSkills || [];

    reportsList.innerHTML += `
      <div class="report-card">
        <h3>Match Score: ${report.matchScore}%</h3>

        <p><b>Date:</b> ${new Date(report.createdAt).toLocaleString()}</p>

        <p><b>Job Description:</b> ${report.jobDescription.substring(0, 150)}...</p>

        <p><b>Matched Skills:</b> ${matched.length ? matched.join(", ") : "None"}</p>

        <p><b>Missing Skills:</b> ${missing.length ? missing.join(", ") : "None"}</p>

        <p><b>Suggestions:</b> ${report.suggestions || "No suggestion available"}</p>

        <div class="report-buttons">
          <button class="btn btn-primary" onclick="viewDetails('${report._id}')">View Details</button>
          <button class="btn btn-success" onclick="downloadPDF('${report._id}')">Download PDF</button>
          <button class="btn btn-danger" onclick="deleteReport('${report._id}')">Delete</button>
        </div>
      </div>
    `;
  });
}

function applyFilters() {
  const searchText = document.getElementById("searchBox").value.toLowerCase();
  const filterScore = document.getElementById("filterScore").value;
  const sortType = document.getElementById("sortReports").value;

  let filtered = allReports.filter((report) => {
    const combinedText =
      (report.jobDescription || "") +
      " " +
      (report.suggestions || "") +
      " " +
      (report.matchedSkills || []).join(" ") +
      " " +
      (report.missingSkills || []).join(" ");

    return combinedText.toLowerCase().includes(searchText);
  });

  // Score Filter
  if (filterScore === "above50") {
    filtered = filtered.filter((r) => r.matchScore >= 50);
  } else if (filterScore === "above70") {
    filtered = filtered.filter((r) => r.matchScore >= 70);
  } else if (filterScore === "below50") {
    filtered = filtered.filter((r) => r.matchScore < 50);
  }

  // Sorting
  if (sortType === "latest") {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortType === "oldest") {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortType === "highscore") {
    filtered.sort((a, b) => b.matchScore - a.matchScore);
  } else if (sortType === "lowscore") {
    filtered.sort((a, b) => a.matchScore - b.matchScore);
  }

  renderReports(filtered);
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

function goToDashboard() {
  window.location.href = "dashboard.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchBox").addEventListener("input", applyFilters);
  document.getElementById("filterScore").addEventListener("change", applyFilters);
  document.getElementById("sortReports").addEventListener("change", applyFilters);
});

fetchReports();
async function deleteReport(reportId) {
  const token = localStorage.getItem("token");

  if (!confirm("Are you sure you want to delete this report?")) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/reports/${reportId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      },
    );

    const data = await response.json();

    if (response.ok) {
      alert("Report deleted successfully!");
      fetchReports(); // refresh list
    } else {
      alert(data.message || "Delete failed");
    }
  } catch (error) {
    alert("Server error!");
  }
}
function downloadPDF(reportId) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first!");
    return;
  }

  fetch(`http://localhost:5000/api/reports/${reportId}/download`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
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
    .catch((error) => {
      alert("Download failed!");
    });
}
function viewDetails(reportId) {
  window.location.href = `report-details.html?id=${reportId}`;
}
