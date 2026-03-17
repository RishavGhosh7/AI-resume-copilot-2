import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ResumeEditor({ suggestions, isLoading, error, onGenerate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          AI-Powered Suggestions
        </h2>
        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
          {suggestions.length} suggestions
        </span>
      </div>

      {error ? (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-slate-700 dark:text-slate-300">{error}</p>
        </div>
      ) : null}

      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generate rewrite suggestions to improve bullets, keywords, and impact.
            </p>
          </div>
        ) : null}
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Original</p>
                  <p className="text-sm text-slate-900 dark:text-slate-100 line-through">{suggestion.original}</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Suggested</p>
                  <p className="text-sm text-slate-900 dark:text-slate-100">{suggestion.suggested}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">{suggestion.reason}</p>
                  <button
                    onClick={() => handleCopy(suggestion.suggested)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Suggestions
            </>
          )}
        </button>
      </div>
    </div>
  );
}
