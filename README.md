# HireVision AI

## Demo Video

🎥 Project Demo:https://drive.google.com/file/d/16Ff4Ibgo1GXeJliaVQcMB92NqPrVp0cS/view?usp=drivesdk


### An AI-Powered Mock Interview System with Emotion Detection and Resume Analysis

HireVision AI is a full-stack platform that helps candidates prepare for job interviews using:
- **Resume Analysis** — NLP-based ATS scoring, skill extraction, and keyword matching against a target role
- **AI Mock Interview** — role-specific question sets with typed answers
- **Emotion Detection** — webcam-based facial emotion analysis (OpenCV + DeepFace/TensorFlow, pre-trained model) captured live during each answer
- **Interview Score Prediction** — technical, communication, and confidence scoring per session
- **Personalized Feedback** — rule-based, actionable feedback generated from performance patterns

---

## Tech Stack

| Layer     | Technology                                        |
|-----------|-----------------------------------------------------|
| Frontend  | React.js, Tailwind CSS, React Router, Recharts, react-webcam |
| Backend   | Node.js, Express.js, JWT auth, Multer                |
| Database  | MongoDB (Mongoose)                                   |
| AI Service| Python, Flask, OpenCV, DeepFace (TensorFlow-backed), PyPDF2/python-docx |

## Architecture

```
frontend (React, :3000)
      │  REST (JWT)
      ▼
backend (Node/Express, :5000) ──── MongoDB
      │  REST (internal)
      ▼
ai-service (Python/Flask, :5001)
  ├─ resume_parser.py   (PDF/DOCX text extraction + NLP analysis)
  ├─ emotion_detector.py (OpenCV + DeepFace pre-trained CNN)
  └─ scorer.py           (answer scoring heuristics)
```

The backend never talks to the AI models directly — it forwards resume files and answer/emotion data to the Python microservice over HTTP, keeping Node.js and Python cleanly separated. If the AI service is briefly unavailable, the backend degrades gracefully (default scores) rather than crashing the interview flow.

---

## Folder Structure

```
HireVision-AI/
├── backend/
│   ├── config/db.js
│   ├── controllers/       # authController, resumeController, interviewController
│   ├── middleware/        # auth.js (JWT), upload.js (Multer)
│   ├── models/            # User, Resume, Question, Interview
│   ├── routes/
│   ├── seed/sampleData.js # sample interview questions
│   ├── server.js
│   └── package.json
├── ai-service/
│   ├── app.py
│   ├── utils/
│   │   ├── resume_parser.py
│   │   ├── emotion_detector.py
│   │   └── scorer.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/         # Login, Register, Dashboard, ResumeUpload, MockInterview, Results, Analytics
│   │   ├── components/    # Navbar, ProtectedRoute, Loader, ScoreCard
│   │   ├── context/AuthContext.js
│   │   └── utils/api.js
│   ├── tailwind.config.js
│   └── package.json
└── docs/
    ├── API_DOCUMENTATION.md
    ├── DATABASE_SCHEMA.md
    └── DEPLOYMENT.md
```

---

## Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string
- npm and pip

---

## Installation & Setup (run all three services)

### 1. Database
Make sure MongoDB is running locally:
```bash
mongod
```
(Or use a MongoDB Atlas URI instead — see `docs/DEPLOYMENT.md`.)

### 2. Backend (Node/Express) — port 5000
```bash
cd backend
npm install
cp .env.example .env      # then edit values if needed
npm run seed               # populates sample interview questions
npm run dev                 # or: npm start
```

### 3. AI Service (Python/Flask) — port 5001
```bash
cd ai-service
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
> **Note:** `deepface` + `tensorflow` are sizeable installs and download a small pre-trained model on first run. If you want to skip emotion detection setup entirely for a faster demo, you can omit these two packages from `requirements.txt` — `emotion_detector.py` automatically falls back to a neutral/confident default so the rest of the app keeps working.

### 4. Frontend (React) — port 3000
```bash
cd frontend
npm install
cp .env.example .env       # then edit values if needed
npm start
```

Open **http://localhost:3000**, register an account, and you're ready to go.

---

## Demo Flow (for screen recording / submission)

1. Register a new account, selecting a target role (e.g. "Frontend Developer")
2. Go to **Resume** → upload a sample PDF/DOCX resume → view ATS score, skills, keyword match, strengths/improvements
3. Go to **Mock Interview** → start a session → answer 5 role-specific questions with webcam on
4. On the final question, the interview auto-completes and redirects to **Results**, showing overall/technical/communication/confidence scores, per-question emotion breakdown, and personalized feedback
5. Go to **Analytics** to see score trends across completed interviews

---

## Notes on the AI Components

- **Resume analysis** uses rule-based NLP (keyword/regex matching against a skill and role-keyword bank) rather than a paid LLM API, so it runs fully offline and free.
- **Emotion detection** uses a **pre-trained** CNN (via DeepFace) rather than training a model from scratch — training a reliable FER model needs large labeled datasets and GPU time that aren't practical for a course/internship timeline. This is genuine computer vision, not a placeholder.
- **Answer scoring** uses heuristic NLP (length, keyword overlap with the question, structure signals, filler-word detection) — transparent, explainable, and doesn't require an external API key.

## License
Built for academic/internship submission purposes.
