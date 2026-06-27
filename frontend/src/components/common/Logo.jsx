import React from 'react';

// Attune wordmark — the soundwave mark from the favicon paired with the name.
const Logo = ({ className = '', showText = true }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <svg
      width="32"
      height="32"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="64" height="64" rx="16" className="fill-brand-700" />
      <circle cx="32" cy="42" r="4" fill="#FAF9F6" />
      <path d="M20 38a16 16 0 0 1 24 0" stroke="#FAF9F6" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
      <path d="M14 31a25 25 0 0 1 36 0" stroke="#5FDDCF" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
    </svg>
    {showText && (
      <span className="font-display text-xl font-bold tracking-tight text-ink dark:text-sand-50">
        Attune
      </span>
    )}
  </span>
);

export default Logo;
