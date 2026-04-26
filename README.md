# AI Resume Analyzer

AI Resume Analyzer is a full-stack project that compares a resume with a job description and generates a match score with skill-based suggestions.

## Tech Stack

- Frontend: HTML, CSS, JavaScript (served as static files)
- Backend: Node.js, Express, MongoDB
- AI Service: Python, Flask, scikit-learn

## Prerequisites

- Node.js (v18 or above recommended)
- Python (v3.10 or above recommended)
- MongoDB (local instance running on default port)

## Project Structure

- `client/` -> UI pages and browser JavaScript
- `server/` -> Express API, auth, reports, PDF processing
- `ai-service/` -> Flask API for resume-job similarity analysis

## Setup Instructions

### 1) Clone the repository

```bash
git clone https://github.com/sangalayush/AI-Resume-Analyzer.git
cd AI-Resume-Analyzer
```

### 2) Setup backend (`server`)

```bash
cd server
npm install
copy .env.example .env
```

Edit `server/.env` if needed:

- `PORT=5000`
- `MONGO_URI=mongodb://127.0.0.1:27017/resumeDB`
- `JWT_SECRET=change_this_secret`
- `AI_SERVICE_URL=http://127.0.0.1:6000`

### 3) Setup AI service (`ai-service`)

Open a new terminal:

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 4) Run the app

Terminal 1 (AI service):

```bash
cd ai-service
venv\Scripts\activate
python app.py
```

Terminal 2 (Node server + frontend):

```bash
cd server
npm start
```

Then open:

`http://localhost:5000`

## Notes

- Frontend is served directly by Express from the `client` folder.
- API URLs in frontend are now based on current host, so project works on any host/port where the server runs.
- For production use, set a strong `JWT_SECRET` and secure your MongoDB setup.
