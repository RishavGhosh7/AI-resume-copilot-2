import { TrendingUp, AlertTriangle, CheckCircle2, Circle, Loader2 } from 'lucide-react';

export default function SkillGapAnalysis({ data, isLoading, error }) {
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'proficient':
        return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'developing':
        return <Circle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'gap':
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'proficient':
        return 'bg-green-500';
      case 'developing':
        return 'bg-yellow-500';
      case 'gap':
        return 'bg-red-500';
      default:
        return 'bg-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Skill Gap Analysis
        </h2>
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-slate-400 dark:text-slate-500 animate-spin" />
        ) : null}
      </div>

      {error ? (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-slate-700 dark:text-slate-300">{error}</p>
        </div>
      ) : null}

      <div className="space-y-4">
        {skills.length === 0 ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Run Skill Gap Analysis to see which skills to add for the role.
            </p>
          </div>
        ) : null}
        {skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(skill.status)}
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{skill.name}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {skill.level}% / {skill.required}% required
              </span>
            </div>

            <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${getStatusColor(skill.status)}`}
                style={{ width: `${skill.level}%` }}
              />
              <div
                className="absolute inset-y-0 border-r-2 border-slate-400 dark:border-slate-500 border-dashed"
                style={{ left: `${skill.required}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recommendations</h3>
        {recommendations.length === 0 ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">No recommendations yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  rec.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                {rec.priority === 'high' ? (
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                )}
                <p className="text-sm text-slate-700 dark:text-slate-300">{rec.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
