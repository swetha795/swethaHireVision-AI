# Deployment Guide (Optional — for hosting beyond local demo)

The project has three deployable pieces: **frontend** (static React build), **backend** (Node/Express API), and **ai-service** (Python Flask).

## 1. Database — MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Whitelist your deployment IP (or `0.0.0.0/0` for simplicity during a demo)
3. Copy the connection string into the backend's `MONGO_URI` env variable

## 2. Backend — Render / Railway
1. Push the `backend/` folder to a GitHub repo
2. Create a new Web Service on Render, root directory = `backend`
3. Build command: `npm install` · Start command: `npm start`
4. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `AI_SERVICE_URL`, `PORT`

## 3. AI Service — Render (Python)
1. Push the `ai-service/` folder to a GitHub repo (or same repo, different root dir)
2. Create a new Web Service on Render, root directory = `ai-service`
3. Build command: `pip install -r requirements.txt` · Start command: `python app.py`
4. Note: DeepFace/TensorFlow images are large — use a plan with enough RAM (≥1GB), or deploy with the emotion fallback (the service degrades gracefully if TensorFlow isn't available)

## 4. Frontend — Vercel / Netlify
1. Push the `frontend/` folder to a GitHub repo
2. Import into Vercel, root directory = `frontend`
3. Set environment variable: `REACT_APP_API_URL` = your deployed backend URL + `/api`
4. Build command: `npm run build` · Output directory: `build`

## Environment variable summary

| Service     | Variable          | Example                                  |
|-------------|-------------------|-------------------------------------------|
| backend     | MONGO_URI         | mongodb+srv://user:pass@cluster.mongodb.net/hirevision |
| backend     | JWT_SECRET        | any long random string                    |
| backend     | AI_SERVICE_URL    | https://your-ai-service.onrender.com      |
| frontend    | REACT_APP_API_URL | https://your-backend.onrender.com/api     |

For a college/internship submission, running everything locally (see README) is sufficient — live deployment is optional bonus polish.
