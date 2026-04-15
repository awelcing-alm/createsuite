// Inline SVGs copied from lucide-react v0.563.0 for bundle size reduction (~32KB savings).
// Do NOT replace with lucide-react imports — that defeats the purpose.

import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const iconDefaults = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// App.tsx icons

export const MonitorIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

export const TerminalIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M12 19h8" />
    <path d="m4 17 6-6-6-6" />
  </svg>
);

export const CpuIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M12 20v2" />
    <path d="M12 2v2" />
    <path d="M17 20v2" />
    <path d="M17 2v2" />
    <path d="M2 12h2" />
    <path d="M2 17h2" />
    <path d="M2 7h2" />
    <path d="M20 12h2" />
    <path d="M20 17h2" />
    <path d="M20 7h2" />
    <path d="M7 20v2" />
    <path d="M7 2v2" />
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="8" y="8" width="8" height="8" rx="1" />
  </svg>
);

export const GlobeIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

export const PlayIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
  </svg>
);

export const WifiIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M12 20h.01" />
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <path d="M5 12.859a10 10 0 0 1 14 0" />
    <path d="M8.5 16.429a5 5 0 0 1 7 0" />
  </svg>
);

export const BatteryIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M 22 14 L 22 10" />
    <rect x="2" y="6" width="16" height="12" rx="2" />
  </svg>
);

export const SearchIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="m21 21-4.34-4.34" />
    <circle cx="11" cy="11" r="8" />
  </svg>
);

// Window control icons (shared by TerminalWindow, ContentWindow)

export const XIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const MinusIcon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M5 12h14" />
  </svg>
);

export const Maximize2Icon = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M15 3h6v6" />
    <path d="m21 3-7 7" />
    <path d="m3 21 7-7" />
    <path d="M9 21H3v-6" />
  </svg>
);
