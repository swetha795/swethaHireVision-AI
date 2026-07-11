# API Documentation

Base URL: `http://localhost:5000/api`
All protected routes require header: `Authorization: Bearer <token>`

---

## Auth

### POST `/auth/register`
Body: `{ name, email, password, targetRole }`
Returns: `{ success, data: { _id, name, email, targetRole, token } }`

### POST `/auth/login`
Body: `{ email, password }`
Returns: `{ success, data: { _id, name, email, targetRole, token } }`

### GET `/auth/profile` 🔒
Returns the logged-in user's profile.

---

## Resume

### POST `/resume/upload` 🔒
`multipart/form-data`: `resume` (file), `targetRole` (string)
Forwards the file to the Python AI service (`/analyze-resume`) and stores the result.
Returns: `{ success, data: <Resume document> }`

### GET `/resume/my-resumes` 🔒
Returns all resumes uploaded by the logged-in user.

### GET `/resume/:id` 🔒
Returns a single resume by ID.

---

## Interview

### POST `/interview/start` 🔒
Body: `{ role, numQuestions }`
Creates a new interview session and returns questions.
Returns: `{ success, data: { interviewId, questions: [{ id, text, category }] } }`

### POST `/interview/:id/answer` 🔒
Body: `{ question, category, userAnswerText, emotionFrames: [base64...] }`
Sends the answer + captured webcam frames to the AI service (`/analyze-answer`) for emotion detection and scoring, then stores the result.
Returns: `{ success, data: <Answer object> }`

### POST `/interview/:id/complete` 🔒
Finalizes the interview: computes `overallScore`, `technicalScore`, `communicationScore`, `confidenceScore`, and generates `personalizedFeedback`.
Returns: `{ success, data: <Interview document> }`

### GET `/interview/history` 🔒
Returns all interviews (in-progress and completed) for the logged-in user.

### GET `/interview/:id` 🔒
Returns a single interview by ID.

---

## AI Service (Python, internal — called by the backend, not the frontend directly)

Base URL: `http://localhost:5001`

### POST `/analyze-resume`
`multipart/form-data`: `resume` (file), `targetRole`
Returns: `{ skills, detectedRole, experienceYears, atsScore, keywordMatch, strengths, improvementAreas, rawText }`

### POST `/analyze-answer`
JSON body: `{ question, answerText, emotionFrames }`
Returns: `{ emotion: { dominantEmotion, breakdown }, scoring: { score, feedback } }`

### GET `/health`
Simple health check.
