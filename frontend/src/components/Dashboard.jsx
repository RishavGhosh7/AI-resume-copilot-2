import ResumeUpload from './ResumeUpload';
import ATSScoreCard from './ATSScoreCard';
import JobMatchCard from './JobMatchCard';
import SkillGapAnalysis from './SkillGapAnalysis';
import ResumeEditor from './ResumeEditor';
import { useMemo, useState } from 'react';
import {
  analyzeResume,
  getMatchScore,
  getSkillGaps,
  getRewriteSuggestions,
  generateResume,
} from '../services/api';
import { downloadResumePdf } from '../utils/pdf';

export default function Dashboard() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [ats, setAts] = useState({ data: null, loading: false, error: '' });
  const [match, setMatch] = useState({ data: null, loading: false, error: '' });
  const [gap, setGap] = useState({ data: null, loading: false, error: '' });
  const [rewrite, setRewrite] = useState({ data: { suggestions: [] }, loading: false, error: '' });

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    linkedin: '',
    github: '',
    skills: '',
    experience: '',
    projects: '',
    education: '',
  });
  const [gen, setGen] = useState({ resume: '', structured: null, loading: false, error: '' });
  const [resumeTemplate, setResumeTemplate] = useState('chronological');

  const RESUME_TEMPLATES = [
    { id: 'chronological', label: 'Chronological', description: 'Reverse order by date, emphasizes career progression' },
    { id: 'functional', label: 'Functional', description: 'Skills-focused, groups by theme; good for career changers' },
    { id: 'modern', label: 'Modern', description: 'Clean layout, concise bullets, strong action verbs' },
    { id: 'minimal', label: 'Minimal', description: 'One-page, scannable, no filler' },
  ];

  const canRun = useMemo(() => resumeText.trim().length > 40, [resumeText]);
  const canGenerate = useMemo(
    () => (jobDescription || '').trim().length > 60 && (profile.fullName || '').trim().length > 1,
    [jobDescription, profile.fullName]
  );

  const runAll = async () => {
    if (!canRun) return;

    setAts((s) => ({ ...s, loading: true, error: '' }));
    setMatch((s) => ({ ...s, loading: true, error: '' }));
    setGap((s) => ({ ...s, loading: true, error: '' }));

    const jd = jobDescription?.trim() || '';

    const [atsRes, matchRes, gapRes] = await Promise.allSettled([
      analyzeResume(resumeText),
      getMatchScore(resumeText, jd),
      getSkillGaps(resumeText, jd),
    ]);

    if (atsRes.status === 'fulfilled') setAts({ data: atsRes.value, loading: false, error: '' });
    else setAts({ data: null, loading: false, error: atsRes.reason?.message || 'ATS analysis failed' });

    if (matchRes.status === 'fulfilled') setMatch({ data: matchRes.value, loading: false, error: '' });
    else setMatch({ data: null, loading: false, error: matchRes.reason?.message || 'Job match failed' });

    if (gapRes.status === 'fulfilled') setGap({ data: gapRes.value, loading: false, error: '' });
    else setGap({ data: null, loading: false, error: gapRes.reason?.message || 'Skill gap failed' });
  };

  const runRewrite = async () => {
    if (!canRun) return;
    setRewrite((s) => ({ ...s, loading: true, error: '' }));
    try {
      const jd = jobDescription?.trim() || undefined;
      const res = await getRewriteSuggestions(resumeText, jd);
      setRewrite({ data: res, loading: false, error: '' });
    } catch (e) {
      setRewrite({ data: { suggestions: [] }, loading: false, error: e?.message || 'Rewrite failed' });
    }
  };

  const runGenerate = async () => {
    if (!canGenerate) return;
    setGen({ resume: '', structured: null, loading: true, error: '' });
    try {
      const payload = {
        name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        headline: profile.title,
        linkedin: profile.linkedin,
        github: profile.github,
        skills: profile.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        experience: profile.experience,
        projects: profile.projects,
        education: profile.education,
      };
      const res = await generateResume(payload, jobDescription, resumeTemplate);
      const text = res?.resume || '';
      const structured = res?.structured ?? null;
      setGen({ resume: text, structured, loading: false, error: '' });
      if (text) setResumeText(text);
    } catch (e) {
      setGen({ resume: '', structured: null, loading: false, error: e?.message || 'Resume generation failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Optimize your resume with AI-powered insights
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Resume Generator</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Provide a job description + your details. We’ll generate a tailored resume (structured for ATS) and you can download a classic one-page PDF layout.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runGenerate}
              disabled={!canGenerate || gen.loading}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              title={!canGenerate ? 'Add your name and a longer job description' : 'Generate resume'}
            >
              {gen.loading ? 'Generating…' : 'Generate Resume'}
            </button>
            <button
              onClick={() => {
                setGen({ resume: '', structured: null, loading: false, error: '' });
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
            >
              Clear
            </button>
          </div>
        </div>

        {gen.error ? (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-slate-700 dark:text-slate-300">{gen.error}</p>
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Resume template</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RESUME_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setResumeTemplate(t.id)}
                className={`text-left rounded-lg border-2 px-4 py-3 transition-colors ${
                  resumeTemplate === t.id
                    ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="font-medium block">{t.label}</span>
                <span className="text-xs opacity-90 mt-0.5 block">{t.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full name</label>
                <input
                  value={profile.fullName}
                  onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  value={profile.title}
                  onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jane@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  value={profile.location}
                  onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  LinkedIn (optional)
                </label>
                <input
                  value={profile.linkedin}
                  onChange={(e) => setProfile((p) => ({ ...p, linkedin: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  GitHub (optional)
                </label>
                <input
                  value={profile.github}
                  onChange={(e) => setProfile((p) => ({ ...p, github: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Skills (comma separated)
              </label>
              <input
                value={profile.skills}
                onChange={(e) => setProfile((p) => ({ ...p, skills: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="React, TypeScript, Node.js, AWS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Experience (paste, one role per paragraph)
              </label>
              <textarea
                value={profile.experience}
                onChange={(e) => setProfile((p) => ({ ...p, experience: e.target.value }))}
                rows={6}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="Company — Role (Dates)\n- Achievement...\n- Achievement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Projects (separate from experience)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                Personal, academic, or open-source work — links optional. Shown as its own section in the PDF.
              </p>
              <textarea
                value={profile.projects}
                onChange={(e) => setProfile((p) => ({ ...p, projects: e.target.value }))}
                rows={5}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="Project name — GitHub: https://...\n- What you built and impact...\n\nAnother project — Live demo: https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Education
              </label>
              <textarea
                value={profile.education}
                onChange={(e) => setProfile((p) => ({ ...p, education: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="B.Tech in Computer Science — University (Year)"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Job description (required for generation)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="Paste the job description here..."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Tip: include responsibilities + requirements + tech stack for best results.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Generated Resume</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setResumeText(gen.resume)}
                    disabled={!gen.resume}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Use this generated resume for analysis"
                  >
                    Use for Analysis
                  </button>
                  <button
                    onClick={() =>
                      downloadResumePdf({
                        title: profile.fullName || 'resume',
                        resumeText: gen.resume,
                        structured: gen.structured,
                      })
                    }
                    disabled={!gen.resume}
                    className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Download as structured PDF (classic layout) when available"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
              <textarea
                value={gen.resume}
                onChange={(e) => setGen((s) => ({ ...s, resume: e.target.value }))}
                rows={16}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="Your generated resume will appear here..."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Edit the text for analysis or copying. Download PDF uses the structured layout from the model (sections, bullets, skills grid) when generation succeeds.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Job description (optional but recommended)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Paste the job description here to compute match score and skill gaps…"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={runAll}
              disabled={!canRun || ats.loading || match.loading || gap.loading}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              title={!canRun ? 'Paste/upload a resume first' : 'Run analysis'}
            >
              {ats.loading || match.loading || gap.loading ? 'Running…' : 'Run Analysis'}
            </button>
            <button
              onClick={() => {
                setAts({ data: null, loading: false, error: '' });
                setMatch({ data: null, loading: false, error: '' });
                setGap({ data: null, loading: false, error: '' });
                setRewrite({ data: { suggestions: [] }, loading: false, error: '' });
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
            >
              Clear Results
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          This dashboard is now dynamic: it uses your uploaded/pasted resume and (optionally) a job description to call the backend AI endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResumeUpload resumeText={resumeText} setResumeText={setResumeText} />
        <ATSScoreCard data={ats.data} isLoading={ats.loading} error={ats.error} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobMatchCard data={match.data} isLoading={match.loading} error={match.error} />
        <SkillGapAnalysis data={gap.data} isLoading={gap.loading} error={gap.error} />
      </div>

      <ResumeEditor
        suggestions={rewrite.data?.suggestions || []}
        isLoading={rewrite.loading}
        error={rewrite.error}
        onGenerate={runRewrite}
      />
    </div>
  );
}
