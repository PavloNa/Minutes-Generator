// Square caps and joins to match the crisp, document-like UI.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  'aria-hidden': true,
  focusable: false,
};

export const CloseIcon = () => (
  <svg {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>
);

export const UploadIcon = () => (
  <svg {...base}><path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M4 14v6h16v-6" /></svg>
);

export const DocumentIcon = () => (
  <svg {...base}><path d="M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6" /></svg>
);

export const AudioIcon = () => (
  <svg {...base}><path d="M4 10v4 M8 7v10 M12 4v16 M16 8v8 M20 11v2" /></svg>
);

export const SunIcon = () => (
  <svg {...base}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);

export const MoonIcon = () => (
  <svg {...base}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
);

export const MenuIcon = () => (
  <svg {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
