from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

app = Flask(__name__)

def extract_email(text):
    match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else None


def extract_phone(text):
    match = re.search(r"(\+91[-\s]?)?[6-9]\d{9}", text)
    return match.group(0) if match else None


def extract_linkedin(text):
    match = re.search(r"(https?://)?(www\.)?linkedin\.com/in/[a-zA-Z0-9-_]+", text)
    return match.group(0) if match else None


def extract_github(text):
    match = re.search(r"(https?://)?(www\.)?github\.com/[a-zA-Z0-9-_]+", text)
    return match.group(0) if match else None

# simple skill keywords list
SKILLS = [
    "python", "java", "c++", "javascript", "node.js", "express", "mongodb",
    "react", "html", "css", "sql", "mysql", "git", "docker", "aws", "api",
    "rest", "flask", "django"
]

def extract_skills(text):
    text = text.lower()
    found = []
    for skill in SKILLS:
        if re.search(r"\b" + re.escape(skill) + r"\b", text):
            found.append(skill)
    return found

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    resume_text = data.get("resume_text", "")
    job_desc = data.get("job_desc", "")

    if not resume_text or not job_desc:
        return jsonify({"error": "resume_text and job_desc required"}), 400

    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume_text, job_desc])

    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
    match_score = round(similarity * 100, 2)

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_desc)

    matched_skills = list(set(resume_skills) & set(job_skills))
    missing_skills = list(set(job_skills) - set(resume_skills))
    
    

    suggestions = "Try adding more relevant skills and projects related to the job description."

    return jsonify({
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions
    })

if __name__ == "__main__":
    app.run(port=6000, debug=True)