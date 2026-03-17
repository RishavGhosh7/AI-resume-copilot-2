# Deploying AI Resume Copilot

This app has two parts: **frontend** (React + Vite) and **backend** (Express). Deploy the backend first, then the frontend so you can point it at the live API.

---

## 1. Deploy the backend (Render — free tier)

1. **Push your code to GitHub** (create a repo and push; ensure `backend/.env` is **not** committed).

2. Go to [render.com](https://render.com) → **New** → **Web Service**.

3. Connect your repo and set:
   - **Root directory:** `backend`
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free

4. **Environment variables** (in Render dashboard → Environment):
   - `PORT` — leave blank (Render sets it)
   - `OPENROUTER_API_KEY` — your key from [OpenRouter](https://openrouter.ai/keys)  
   - Optional: `OPENROUTER_MODEL` (e.g. `anthropic/claude-3-haiku`) or `OPENAI_API_KEY` if using OpenAI

5. Deploy. Note the backend URL, e.g. `https://your-app-name.onrender.com`.

---

## 2. Deploy the frontend (Vercel — free tier)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** and import your repo.

2. Set:
   - **Root directory:** `frontend`
   - **Framework preset:** Vite (auto-detected)
   - **Build command:** `npm run build`
   - **Output directory:** `dist`

3. **Environment variable** (Vercel → Settings → Environment Variables):
   - **Name:** `VITE_API_BASE_URL`  
   - **Value:** your backend URL from step 1, e.g. `https://your-app-name.onrender.com`  
   - No trailing slash.

4. Deploy. Vercel will build and host the frontend; it will call your Render backend using `VITE_API_BASE_URL`.

---

## 3. Optional: Railway for backend

- [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
- Set **Root directory** to `backend`, add env vars (`OPENROUTER_API_KEY`, etc.).
- Use the generated URL as `VITE_API_BASE_URL` in the frontend.

---

## 4. Checklist

| Item | Where |
|------|--------|
| Backend URL set in frontend | `VITE_API_BASE_URL` on Vercel |
| API key kept secret | `OPENROUTER_API_KEY` (or `OPENAI_API_KEY`) only in Render/Railway env, never in repo |
| CORS | Backend allows all origins (`cors({ origin: true })`); restrict in production if needed |

---

## 5. Local preview of production build

```bash
# Backend
cd backend && npm start

# Frontend (in another terminal)
cd frontend
VITE_API_BASE_URL=http://localhost:3001 npm run build && npm run preview
```

Then open the URL shown by `npm run preview` (e.g. http://localhost:4173).
