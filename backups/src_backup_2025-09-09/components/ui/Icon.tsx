import React from 'react';

// SVG Icon Content Map - 네비게이션 아이콘들
const iconContent: Record<string, string> = {
  clock: `
    <circle cx="12" cy="12" r="10" stroke-width="2" />
    <polyline points="12,6 12,12 16,14" stroke-width="2" />
  `,
  layout: `
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2" />
    <line x1="9" y1="3" x2="9" y2="21" stroke-width="2" />
    <line x1="14" y1="8" x2="14" y2="21" stroke-width="2" />
  `,
  'book-open': `
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke-width="2" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke-width="2" />
  `,
  settings: `
    <circle cx="12" cy="12" r="3" stroke-width="2" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.68a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke-width="2" />
  `,
  'tarot-cards': `
    <g transform="rotate(-15 8 12)">
      <rect x="5" y="7" width="6" height="10" rx="1" ry="1" stroke-width="1.5" fill="none" />
      <line x1="6" y1="9" x2="10" y2="9" stroke-width="1" />
      <line x1="6" y1="11" x2="10" y2="11" stroke-width="1" />
      <circle cx="8" cy="13.5" r="1" stroke-width="1" fill="currentColor" />
    </g>
    <g>
      <rect x="9" y="5" width="6" height="10" rx="1" ry="1" stroke-width="1.5" fill="none" />
      <line x1="10" y1="7" x2="14" y2="7" stroke-width="1" />
      <line x1="10" y1="9" x2="14" y2="9" stroke-width="1" />
      <circle cx="12" cy="11.5" r="1" stroke-width="1" fill="currentColor" />
    </g>
    <g transform="rotate(15 16 12)">
      <rect x="13" y="7" width="6" height="10" rx="1" ry="1" stroke-width="1.5" fill="none" />
      <line x1="14" y1="9" x2="18" y2="9" stroke-width="1" />
      <line x1="14" y1="11" x2="18" y2="11" stroke-width="1" />
      <circle cx="16" cy="13.5" r="1" stroke-width="1" fill="currentColor" />
    </g>
    <g opacity="0.6">
      <circle cx="6" cy="5" r="0.5" fill="currentColor" />
      <circle cx="18" cy="6" r="0.5" fill="currentColor" />
      <circle cx="12" cy="19" r="0.5" fill="currentColor" />
    </g>
  `,
  moon: `
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-width="2" />
  `,
  star: `
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke-width="2" />
  `,
  sparkles: `
    <path d="M9 12l2 2 4-4" stroke-width="2" />
    <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" />
    <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" />
    <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" />
    <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" />
    <path d="M5.05 5.05c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41-.39.39-.71.39-.71-.18-.71-.39c0-.39.32-.71.71-.71z" />
    <path d="M18.95 18.95c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41-.39.39-.71.39-.71-.18-.71-.39c0-.39.32-.71.71-.71z" />
  `,
  zap: `
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" stroke-width="2" />
  `,
  'chevron-left': `
    <polyline points="15,18 9,12 15,6" stroke-width="2" />
  `,
  check: `
    <polyline points="20,6 9,17 4,12" stroke-width="2" />
  `,
  x: `
    <line x1="18" y1="6" x2="6" y2="18" stroke-width="2" />
    <line x1="6" y1="6" x2="18" y2="18" stroke-width="2" />
  `,
  eye: `
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2" />
    <circle cx="12" cy="12" r="3" stroke-width="2" />
  `,
  calendar: `
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2" />
    <line x1="16" y1="2" x2="16" y2="6" stroke-width="2" />
    <line x1="8" y1="2" x2="8" y2="6" stroke-width="2" />
    <line x1="3" y1="10" x2="21" y2="10" stroke-width="2" />
    <path d="M8 14h.01" stroke-width="2" />
    <path d="M12 14h.01" stroke-width="2" />
    <path d="M16 14h.01" stroke-width="2" />
    <path d="M8 18h.01" stroke-width="2" />
    <path d="M12 18h.01" stroke-width="2" />
  `,
  sun: `
    <circle cx="12" cy="12" r="5" stroke-width="2" />
    <line x1="12" y1="1" x2="12" y2="3" stroke-width="2" />
    <line x1="12" y1="21" x2="12" y2="23" stroke-width="2" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-width="2" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-width="2" />
    <line x1="1" y1="12" x2="3" y2="12" stroke-width="2" />
    <line x1="21" y1="12" x2="23" y2="12" stroke-width="2" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-width="2" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-width="2" />
  `,
  globe: `
    <circle cx="12" cy="12" r="10" stroke-width="2" />
    <line x1="2" y1="12" x2="22" y2="12" stroke-width="2" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke-width="2" />
  `,
  'rotate-ccw': `
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke-width="2" />
    <path d="M3 3v5h5" stroke-width="2" />
  `,
  save: `
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-width="2" />
    <polyline points="17,21 17,13 7,13 7,21" stroke-width="2" />
    <polyline points="7,3 7,8 15,8" stroke-width="2" />
  `,
  shuffle: `
    <polyline points="16,3 21,3 21,8" stroke-width="2" />
    <line x1="4" y1="20" x2="21" y2="3" stroke-width="2" />
    <polyline points="21,16 21,21 16,21" stroke-width="2" />
    <line x1="15" y1="15" x2="21" y2="21" stroke-width="2" />
    <line x1="4" y1="4" x2="9" y2="9" stroke-width="2" />
  `,
};

export type IconName = keyof typeof iconContent;

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className = '', 
  size = 24,
  color = 'currentColor' 
}) => {
  const content = iconContent[name];

  if (!content) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <svg 
      width={size} 
      height={size} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default Icon;