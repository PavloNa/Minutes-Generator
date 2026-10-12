import { useId } from 'react';

// Mark: audio waveform bars (left) turning into lines of minutes (right).
function Logo({ size = 28 }) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5b7cff" />
          <stop offset="0.55" stopColor="#9d7bff" />
          <stop offset="1" stopColor="#ff7fb0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <g stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round">
        <path d="M7.5 13v6M11 9.5v13M14.5 12v8" />
        <path d="M19 11h6M19 16h5M19 21h3.5" opacity="0.92" />
      </g>
    </svg>
  );
}

export default Logo;
