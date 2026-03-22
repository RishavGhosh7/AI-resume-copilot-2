import OpenAI from 'openai';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

function getClient() {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openRouterKey) {
    return new OpenAI({
      apiKey: openRouterKey,
      baseURL: OPENROUTER_BASE,
    });
  }
  if (openaiKey) {
    return new OpenAI({ apiKey: openaiKey });
  }
  throw new Error(
    'Set either OPENAI_API_KEY or OPENROUTER_API_KEY in backend/.env. ' +
    'Use OpenRouter for Claude, Gemini, Llama, etc. (see https://openrouter.ai/models)'
  );
}

function getModel() {
  const model = process.env.AI_MODEL?.trim();
  if (model) return model;
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';
  }
  return 'gpt-4o-mini';
}

export function getProviderInfo() {
  if (process.env.OPENROUTER_API_KEY) {
    return { provider: 'openrouter', model: getModel() };
  }
  if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', model: getModel() };
  }
  return { provider: null, model: null };
}

/**
 * Parse JSON from LLM response. Strips markdown code fences and handles trailing text.
 */
function parseJsonFromLLM(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Empty or invalid response');
  let text = raw.trim();
  const codeBlockMatch = text.match(/^```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) text = codeBlockMatch[1].trim();
  try {
    return JSON.parse(text);
  } catch (e) {
    const start = text.indexOf('{');
    if (start === -1) throw new Error('No JSON object in response');
    let depth = 0;
    let end = -1;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end !== -1) return JSON.parse(text.slice(start, end + 1));
    throw e;
  }
}

/**
 * Resume Analyzer: ATS readiness, strengths, weaknesses, suggestions.
 * Returns shape for ATSScoreCard: { score, issues: [{ type, text }] }
 */
export async function analyzeResume(resumeText) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: 'system',
        content: `You are an ATS (Applicant Tracking System) and resume expert. Analyze resumes and return JSON only, no markdown.
Return this exact structure:
{
  "score": <number 0-100, ATS compatibility>,
  "issues": [
    { "type": "success" | "warning" | "info", "text": "<short finding>" }
  ],
  "strengths": ["<strength>"],
  "weaknesses": ["<weakness>"],
  "suggestions": ["<actionable tip>"]
}
Include 3-5 issues. Use "success" for positive findings, "warning" for problems, "info" for neutral tips.`
      },
      {
        role: 'user',
        content: `Analyze this resume for ATS compatibility and quality:\n\n${resumeText.slice(0, 12000)}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('No analysis response');
  return parseJsonFromLLM(raw);
}

/**
 * Job Match Score: resume + job description → score, matched keywords, explanation.
 * Returns shape for JobMatchCard: matchScore, matchedSkills, matchedCount, totalRequirements
 */
export async function getMatchScore(resumeText, jobDescription) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: 'system',
        content: `You are a recruiter matching resumes to job descriptions. Return JSON only, no markdown.
Return this exact structure:
{
  "matchScore": <number 0-100>,
  "matchedSkills": ["<skill or keyword from JD that appears in resume>"],
  "missingKeywords": ["<important JD keyword not clearly in resume>"],
  "matchedCount": <number of key requirements matched>,
  "totalRequirements": <number of key requirements in JD>,
  "explanation": "<1-2 sentence summary>"
}
Extract 5-15 matched skills and 3-10 missing keywords. Be specific.`
      },
      {
        role: 'user',
        content: `Resume:\n${resumeText.slice(0, 8000)}\n\n---\nJob description:\n${(jobDescription || '').slice(0, 6000)}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('No match response');
  return parseJsonFromLLM(raw);
}

/**
 * Skill Gap Analysis: resume/skills + job description → gaps, levels, recommendations.
 * Returns shape for SkillGapAnalysis: skills[], recommendations
 */
export async function getSkillGaps(resumeText, jobDescription) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: 'system',
        content: `You are a career coach. Compare the resume to the job description and identify skill gaps. Return JSON only, no markdown.
Return this exact structure:
{
  "skills": [
    {
      "name": "<skill name>",
      "level": <0-100, inferred from resume>,
      "required": <0-100, importance for this job>,
      "status": "proficient" | "developing" | "gap"
    }
  ],
  "recommendations": [
    { "priority": "high" | "medium", "text": "<actionable recommendation>" }
  ]
}
Use "proficient" when level >= required, "developing" when close, "gap" when clearly missing. Include 4-8 skills. 1-3 recommendations.`
      },
      {
        role: 'user',
        content: `Resume:\n${resumeText.slice(0, 8000)}\n\n---\nJob description:\n${(jobDescription || '').slice(0, 6000)}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('No skill gap response');
  return parseJsonFromLLM(raw);
}

/**
 * AI Resume Rewriter: suggest improvements for bullets/summary.
 * Returns shape for ResumeEditor: suggestions[{ type, original, suggested, reason }]
 */
export async function rewriteResume(resumeText, jobDescription = null) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: 'system',
        content: `You are a resume writer. Suggest concrete improvements for resume bullets/sentences. Return only valid JSON, no markdown, no code fences.
Rules: Each string value must be on one line; use \\n for line breaks. Escape quotes inside strings. No trailing commas.
Return this exact structure:
{
  "suggestions": [
    {
      "type": "improvement" or "keyword" or "metrics",
      "original": "exact or summarized original phrase",
      "suggested": "rewritten stronger version",
      "reason": "short reason e.g. Add quantifiable metrics"
    }
  ]
}
Give 2-5 suggestions. Keep original, suggested, and reason concise. Types: improvement (clarity/tone), keyword (JD alignment), metrics (add numbers).`
      },
      {
        role: 'user',
        content: jobDescription
          ? `Resume:\n${resumeText.slice(0, 8000)}\n\nJob description (optimize for this):\n${jobDescription.slice(0, 4000)}`
          : `Suggest improvements for this resume:\n\n${resumeText.slice(0, 10000)}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('No rewrite response');
  return parseJsonFromLLM(raw);
}

const RESUME_TEMPLATES = {
  chronological: 'Structure in reverse chronological order (most recent first). Emphasize dates and job progression. Sections: Education, Skills, Experience, Projects (include projects if relevant).',
  functional: 'Skills and achievements first; group experience by themes when helpful. Strong Skills grid; still include dated experience and projects where they add credibility.',
  modern: 'Concise bullets, strong action verbs, quantifiable results. Section order: Education, Skills, Experience, Projects.',
  minimal: 'One-page focus: tight bullets, no filler; only the most relevant education, skills, experience, and 1–2 projects.',
};

/**
 * Merge LLM output with profile so PDF header and links stay consistent when the model omits fields.
 */
function normalizeStructuredResume(structured, profile) {
  const s = structured && typeof structured === 'object' ? structured : {};
  const headerIn = s.header && typeof s.header === 'object' ? s.header : {};
  const name =
    headerIn.fullName ||
    profile?.name ||
    profile?.fullName ||
    '';
  return {
    header: {
      fullName: String(name).trim(),
      phone: String(headerIn.phone ?? profile?.phone ?? '').trim(),
      location: String(headerIn.location ?? profile?.location ?? '').trim(),
      email: String(headerIn.email ?? profile?.email ?? '').trim(),
      linkedin: String(headerIn.linkedin ?? profile?.linkedin ?? '').trim(),
      github: String(headerIn.github ?? profile?.github ?? '').trim(),
    },
    education: Array.isArray(s.education) ? s.education : [],
    skills: Array.isArray(s.skills) ? s.skills : [],
    experience: Array.isArray(s.experience) ? s.experience : [],
    projects: Array.isArray(s.projects) ? s.projects : [],
  };
}

/**
 * Resume Generator: personal info + experience + job description + template → full resume + structured data for PDF.
 */
export async function generateResume(profile, jobDescription, template = '') {
  const templateKey = (template || 'chronological').toLowerCase().replace(/\s+/g, '');
  const templateGuide = RESUME_TEMPLATES[templateKey] || RESUME_TEMPLATES.chronological;

  const client = getClient();
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: 'system',
        content: `You are a professional resume writer. Generate an ATS-friendly resume tailored to the job description.
Template / emphasis: ${templateGuide}

Return ONLY valid JSON, no markdown fences, no commentary. Use this exact top-level shape:
{
  "resume": "<full plain-text resume with \\n line breaks; traditional sections; suitable for editing>",
  "structured": {
    "header": {
      "fullName": "<string>",
      "phone": "<string>",
      "location": "<string>",
      "email": "<string>",
      "linkedin": "<full URL or empty string>",
      "github": "<full URL or empty string>"
    },
    "education": [
      {
        "degree": "<e.g. B.Tech Computer Science>",
        "institution": "<school name>",
        "location": "<city, country or region>",
        "dateOrStatus": "<e.g. Completed, 2024 or Expected 2026>"
      }
    ],
    "skills": [
      { "category": "<e.g. Languages>", "items": ["<skill1>", "<skill2>"] }
    ],
    "experience": [
      {
        "title": "<job title>",
        "company": "<company name>",
        "dateRange": "<e.g. November 2025 – March 2026>",
        "bullets": [
          "<Start with action verb. Use **double asterisks** around important tech terms, metrics, and product names inside each string.>"
        ]
      }
    ],
    "projects": [
      {
        "name": "<project title>",
        "link": { "label": "GitHub" | "Live Demo" | "Website" | "", "url": "<https://... or empty>" },
        "bullets": ["<same **bold** convention as experience>"]
      }
    ]
  },
  "sections": { "summary": "", "experience": "", "skills": "", "education": "" }
}

Rules:
- Fill "structured" completely from the profile and job description; align content with "resume".
- The profile JSON may include "projects" as free text from the user: treat it as the primary source for structured.projects (names, links, bullets). Do not merge project work into experience unless it was a formal job or internship.
- Use 3–8 skill categories with realistic items from the profile/JD.
- 1–4 education entries; 0–5 experience entries; 0–6 projects (omit projects array or use [] if none fit).
- For freshers or students with no paid/internship experience, set "experience" to [] and put academic work, personal projects, and open-source in "projects" with strong bullets (the PDF uses a dedicated Projects section).
- Bullets: 3–6 per role/project when possible; include quantified impact where plausible.
- In bullet strings, wrap key technologies, frameworks, and metrics with **...** for emphasis (e.g. **Python**, **AWS**, **40%**).
- Escape double quotes inside JSON strings as \\".
- "sections" may repeat condensed text or mirror parts of resume; omit empty section values.`
      },
      {
        role: 'user',
        content: `Profile (JSON): ${JSON.stringify(profile)}\n\nJob description:\n${(jobDescription || '').slice(0, 5000)}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('No generation response');

  try {
    const parsed = parseJsonFromLLM(raw);
    const structured = normalizeStructuredResume(parsed.structured, profile);
    return {
      resume: parsed.resume || '',
      structured,
      sections: parsed.sections && typeof parsed.sections === 'object' ? parsed.sections : {},
    };
  } catch (e) {
    const trimmed = raw.trim();
    if (!trimmed) throw new Error('No generation response');
    const resumeText = trimmed
      .replace(/^Here\s+is\s+(?:a\s+)?(?:tailored\s+)?resume[:\s]*/i, '')
      .replace(/^Here\s+is\s+your\s+resume[:\s]*/i, '')
      .trim();
    return {
      resume: resumeText || trimmed,
      structured: normalizeStructuredResume(null, profile),
      sections: {},
    };
  }
}
