import { Target, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

export default function ATSScoreCard({ data, isLoading, error }) {
  const score = typeof data?.score === 'number' ? data.score : null;
  const issues = Array.isArray(data?.issues) ? data.issues : [];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/30';
    return 'bg-red-50 dark:bg-red-900/30';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ATS Compatibility Score
        </h2>
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-slate-400 dark:text-slate-500 animate-spin" />
        ) : (
          <TrendingUp className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        )}
      </div>

      {error ? (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-slate-700 dark:text-slate-300">{error}</p>
        </div>
      ) : null}

      <div className="flex items-center gap-6 mb-6">
        <div
          className={`w-24 h-24 rounded-full ${
            score === null ? 'bg-slate-50 dark:bg-slate-700' : getScoreBgColor(score)
          } flex items-center justify-center`}
        >
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${
                score === null ? 'text-slate-400 dark:text-slate-500' : getScoreColor(score)
              }`}
            >
              {score === null ? '--' : score}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">/ 100</div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  score === null
                    ? 'bg-slate-300'
                    : score >= 80
                    ? 'bg-green-500'
                    : score >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${score === null ? 0 : score}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {score === null
              ? 'Upload/paste a resume and run analysis'
              : score >= 80
              ? 'Excellent'
              : score >= 60
              ? 'Good'
              : 'Needs Improvement'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key Issues</h3>
        {issues.length === 0 ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No issues yet. Run ATS analysis to see feedback.
            </p>
          </div>
        ) : null}
        {issues.map((issue, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
          >
            <AlertCircle
              className={`w-4 h-4 mt-0.5 ${
                issue.type === 'success'
                  ? 'text-green-600 dark:text-green-400'
                  : issue.type === 'warning'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            />
            <p className="text-sm text-slate-700 dark:text-slate-300">{issue.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
