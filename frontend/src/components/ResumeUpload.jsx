import { Upload, FileText, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { extractResumeText } from '../utils/extractResumeText';

export default function ResumeUpload({ resumeText, setResumeText }) {
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setFileName(file.name);
    setUploaded(true);
    setIsParsing(true);

    extractResumeText(file)
      .then((text) => {
        setResumeText(text);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to read resume');
        setUploaded(false);
        setFileName('');
      })
      .finally(() => {
        setIsParsing(false);
      });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upload Resume</h2>

      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
        {!uploaded ? (
          <label className="cursor-pointer block">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  PDF, DOCX, TXT (max 5MB)
                </p>
              </div>
            </div>
          </label>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              {isParsing ? (
                <Loader2 className="w-6 h-6 text-slate-600 dark:text-slate-400 animate-spin" />
              ) : (
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {fileName}
              </p>
              {isParsing ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Extracting text…</p>
              ) : null}
              <button
                onClick={() => {
                  setUploaded(false);
                  setFileName('');
                  setError('');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2"
              >
                Upload different file
              </button>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
          <p className="text-sm text-slate-700 dark:text-slate-300">{error}</p>
        </div>
      ) : null}

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Or paste your resume text
        </label>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          placeholder="Paste your resume here…"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Tip: if you upload a PDF/DOCX, we’ll extract text automatically.
        </p>
      </div>
    </div>
  );
}
