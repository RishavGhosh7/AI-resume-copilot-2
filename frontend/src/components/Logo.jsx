/**
 * Logo mark for Resume Copilot: document + sparkle (AI).
 * Inline SVG, no external assets; supports light/dark via currentColor.
 */
export default function Logo({ className = 'w-8 h-8' }) {
  return (
    <svg
      className={`${className} text-white dark:text-slate-900`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Document */}
      <path
        d="M8 4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10.83a2 2 0 0 0-.59-1.42L19.58 4.58A2 2 0 0 0 18.17 4H8Z"
        className="fill-blue-600 dark:fill-blue-400"
      />
      <path
        d="M18 4v6a2 2 0 0 0 2 2h6"
        className="stroke-blue-600 dark:stroke-blue-400"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Lines (resume text) */}
      <path
        d="M10 14h12M10 18h9M10 22h11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Sparkle (AI / copilot) */}
      <path
        d="M22 6.5L23 8l1.5-1.5L26 8l-1 1.5L26 11l-2.5-1L21 11l1-1.5-1-1.5 2.5 1L22 6.5Z"
        className="fill-amber-400 dark:fill-amber-300"
      />
    </svg>
  );
}
