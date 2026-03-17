/**
 * API client for AI Resume Copilot backend.
 * Set VITE_API_BASE_URL or leave empty to use same origin (use Vite proxy in dev).
 */

const BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function analyzeResume(resumeText) {
  const res = await fetch(`${BASE}/api/resume/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function getMatchScore(resumeText, jobDescription) {
  const res = await fetch(`${BASE}/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, jobDescription }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function getSkillGaps(resumeText, jobDescription) {
  const res = await fetch(`${BASE}/api/skill-gap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, jobDescription }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function getRewriteSuggestions(resumeText, jobDescription) {
  const res = await fetch(`${BASE}/api/rewrite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, jobDescription }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function generateResume(profile, jobDescription, template) {
  const res = await fetch(`${BASE}/api/resume/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, jobDescription, template: template || undefined }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}
