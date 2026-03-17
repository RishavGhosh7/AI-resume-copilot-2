import { Briefcase, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';

export default function JobMatchCard({ data, isLoading, error }) {
  const matchScore = typeof data?.matchScore === 'number' ? data.matchScore : null;
  const matchedSkills = Array.isArray(data?.matchedSkills) ? data.matchedSkills : [];
  const matchedCount = typeof data?.matchedCount === 'number' ? data.matchedCount : null;
  const totalRequirements = typeof data?.totalRequirements === 'number' ? data.totalRequirements : null;

  const label =
    matchScore === null ? '—' : matchScore >= 80 ? 'Strong Match' : matchScore >= 60 ? 'Moderate Match' : 'Weak Match';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Job Match Score
        </h2>
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-slate-400 dark:text-slate-500 animate-spin" />
        ) : (
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
        )}
      </div>

      {error ? (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-slate-700 dark:text-slate-300">{error}</p>
        </div>
      ) : null}

      <div className="flex items-center gap-6 mb-6">
        <div className={`w-24 h-24 rounded-full ${matchScore === null ? 'bg-slate-50 dark:bg-slate-700' : 'bg-green-50 dark:bg-green-900/30'} flex items-center justify-center`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${matchScore === null ? 'text-slate-400 dark:text-slate-500' : 'text-green-600 dark:text-green-400'}`}>
              {matchScore === null ? '--' : matchScore}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">/ 100</div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${matchScore === null ? 0 : matchScore}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{matchScore === null ? 'Add a job description and run analysis' : label}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Matched Skills</h3>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.length === 0 ? (
            <span className="text-sm text-slate-600 dark:text-slate-400">No matches yet.</span>
          ) : null}
          {matchedSkills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {matchedCount !== null && totalRequirements !== null ? (
            <>
              Your resume matches{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {matchedCount} out of {totalRequirements}
              </span>{' '}
              key requirements for this position.
            </>
          ) : (
            <>We’ll calculate matched requirements once you run Job Match.</>
          )}
        </p>
      </div>
    </div>
  );
}
