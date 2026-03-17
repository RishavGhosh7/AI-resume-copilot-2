# AI Resume Copilot — Backend API

Node.js/Express backend for the five Copilot features: **Resume Analyzer**, **Resume Generator**, **Job Match Score**, **Skill Gap Analysis**, and **AI Resume Rewriter**.

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...
npm install
npm run dev
```

Server runs at `http://localhost:3001` (or `PORT` from `.env`).

## Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| POST | `/api/resume/analyze` | `{ resumeText }` | ATS analysis → `score`, `issues[]` |
| POST | `/api/resume/generate` | `{ profile, jobDescription? }` | Generate full resume |
| POST | `/api/match` | `{ resumeText, jobDescription? }` | Job match score → `matchScore`, `matchedSkills[]` |
| POST | `/api/skill-gap` | `{ resumeText, jobDescription? }` | Skill gaps → `skills[]`, `recommendations[]` |
| POST | `/api/rewrite` | `{ resumeText, jobDescription? }` | Rewrite suggestions → `suggestions[]` |

Response shapes align with the frontend dashboard components (ATSScoreCard, JobMatchCard, SkillGapAnalysis, ResumeEditor).

## Environment

- `PORT` — Server port (default `3001`)
- **LLM (set one):**
  - `OPENAI_API_KEY` — Use OpenAI (default model: `gpt-4o-mini`)
  - `OPENROUTER_API_KEY` — Use [OpenRouter](https://openrouter.ai) for **any** model (Claude, Gemini, Llama, Mistral, etc.). Optional: `OPENROUTER_MODEL` (default: `anthropic/claude-3-haiku`) or set `AI_MODEL` to any [OpenRouter model id](https://openrouter.ai/models).
- `AI_MODEL` — Override model (e.g. `gpt-4o` for OpenAI, or an OpenRouter id like `google/gemini-flash-1.5`).

`GET /health` returns `{ status, provider, model }` so you can confirm which LLM is active.
