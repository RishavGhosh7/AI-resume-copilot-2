# AI Resume Copilot

AI Resume Copilot is a full-stack web app that helps you improve your resume using AI. It provides an ATS-style analysis, generates resume content from your profile, scores your match against a job description, identifies skill gaps, and rewrites your resume for better clarity and relevance.

The application is split into two parts:
- `frontend/` (React + Vite) for the user interface
- `backend/` (Node.js + Express) for API endpoints and LLM (OpenAI/OpenRouter) calls

## Features

1. **Resume Analyzer (ATS insights)**
   - Analyzes your resume text and returns an ATS score and detected issues.

2. **Resume Generator**
   - Generates a full resume (or sections) based on your profile and an optional job description.

3. **Job Match Score**
   - Compares your resume to a job description and returns an overall match score plus matched skills.

4. **Skill Gap Analysis**
   - Identifies missing skills and provides recommendations to help you close the gap.

5. **AI Resume Rewriter**
   - Rewrites suggestions to improve your resume based on the target job description.

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Supabase (`@supabase/supabase-js`)
- PDF utilities:
  - `jsPDF`
  - `pdfjs-dist`
- Resume parsing:
  - `mammoth` (DOCX)
- Icons: `lucide-react`
- Linting: ESLint

### Backend
- Node.js (ES modules)
- Express
- OpenAI SDK (`openai`) for LLM requests
- File uploads: `multer`
- Config: `dotenv`
- CORS: `cors`

## API Endpoints (Backend)

The backend exposes these endpoints:
- `GET /health`
- `POST /api/resume/analyze` (resume text -> ATS score and issues)
- `POST /api/resume/generate` (profile + optional job description -> generated resume)
- `POST /api/match` (resume text + optional job description -> match score and skills)
- `POST /api/skill-gap` (resume text + optional job description -> skills and recommendations)
- `POST /api/rewrite` (resume text + optional job description -> rewrite suggestions)

Response shapes are designed to match the frontend dashboard components.

## Local Setup

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The server runs on `http://localhost:3001` (or `PORT` from `.env`).

### 2) Frontend
In a separate terminal:
```bash
cd frontend
VITE_API_BASE_URL=http://localhost:3001 npm install
npm run dev
```

## Environment Variables

The backend uses one of these for the LLM provider:
- `OPENAI_API_KEY` (OpenAI)
- `OPENROUTER_API_KEY` (OpenRouter; supports models like Claude/Gemini/Llama/etc.)

Optional backend variables include:
- `OPENROUTER_MODEL` (default model varies by your setup)
- `AI_MODEL` (override model id)
- `PORT`

The frontend requires:
- `VITE_API_BASE_URL` (backend URL, no trailing slash)

## Deployment (Quick Guide)

- Backend: deploy `backend/` to **Render** or **Railway**
- Frontend: deploy `frontend/` to **Vercel**
- Point the frontend to the deployed backend using `VITE_API_BASE_URL`

For step-by-step deployment details, see `DEPLOY.md`.

## Notes

- Keep API keys secret (do not commit `.env`).
- If you use OpenRouter, you can set `OPENROUTER_MODEL` / `AI_MODEL` to choose a model.

