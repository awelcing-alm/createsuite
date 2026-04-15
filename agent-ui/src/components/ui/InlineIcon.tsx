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
export const Key = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" key="g0fldk" />
    <path d="m21 2-9.6 9.6" key="1j0ho8" />
    <circle cx="7.5" cy="15.5" r="5.5" key="yqb3hr" />
  </svg>
);

export const CheckCircle = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M21.801 10A10 10 0 1 1 17 3.335" key="yps3ct" />
    <path d="m9 11 3 3L22 4" key="1pflzl" />
  </svg>
);

export const XCircle = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <circle cx="12" cy="12" r="10" key="1mglay" />
    <path d="m15 9-6 6" key="1uzhvr" />
    <path d="m9 9 6 6" key="z0biqf" />
  </svg>
);

export const ArrowRight = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M5 12h14" key="1ays0h" />
    <path d="m12 5 7 7-7 7" key="xquz4c" />
  </svg>
);

export const ArrowLeft = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="m12 19-7-7 7-7" key="1l729n" />
    <path d="M19 12H5" key="x3x0zl" />
  </svg>
);

export const AlertTriangle = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" key="wmoenq" />
    <path d="M12 9v4" key="juzpu7" />
    <path d="M12 17h.01" key="p32p05" />
  </svg>
);

export const Sparkles = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" key="1s2grr" />
    <path d="M20 2v4" key="1rf3ol" />
    <path d="M22 4h-4" key="gwowj6" />
    <circle cx="4" cy="20" r="2" key="6kqj1y" />
  </svg>
);

export const Settings = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" key="1i5ecw" />
    <circle cx="12" cy="12" r="3" key="1v7zrd" />
  </svg>
);

export const ExternalLink = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M15 3h6v6" key="1q9fwt" />
    <path d="M10 14 21 3" key="gplh6r" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" key="a6xqqp" />
  </svg>
);

export const Users = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" key="1yyitq" />
    <path d="M16 3.128a4 4 0 0 1 0 7.744" key="16gr8j" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" key="kshegd" />
    <circle cx="9" cy="7" r="4" key="nufk8" />
  </svg>
);

export const Pencil = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" key="1a8usu" />
    <path d="m15 5 4 4" key="1mk7zo" />
  </svg>
);

export const MessageSquare = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" key="18887p" />
  </svg>
);

export const Clock = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M12 6v6l4 2" key="mmk7yg" />
    <circle cx="12" cy="12" r="10" key="1mglay" />
  </svg>
);

export const Power = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M12 2v10" key="mnfbl" />
    <path d="M18.4 6.6a9 9 0 1 1-12.77.04" key="obofu9" />
  </svg>
);

export const Hammer = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9" key="1hayfq" />
    <path d="m18 15 4-4" key="16gjal" />
    <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" key="15ts47" />
  </svg>
);

export const Pause = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <rect x="14" y="3" width="5" height="18" rx="1" key="kaeet6" />
    <rect x="5" y="3" width="5" height="18" rx="1" key="1wsw3u" />
  </svg>
);

export const Zap = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" key="1xq2db" />
  </svg>
);

export const Server = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" key="ngkwjq" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" key="iecqi9" />
    <line x1="6" x2="6.01" y1="6" y2="6" key="16zg32" />
    <line x1="6" x2="6.01" y1="18" y2="18" key="nzw8ys" />
  </svg>
);

export const Square = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" key="afitv7" />
  </svg>
);

export const RefreshCw = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" key="v9h5vc" />
    <path d="M21 3v5h-5" key="1q7to0" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" key="3uifl3" />
    <path d="M8 16H3v5" key="1cv678" />
  </svg>
);

export const Check = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M20 6 9 17l-5-5" key="1gmf2c" />
  </svg>
);

export const AlertCircle = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <circle cx="12" cy="12" r="10" key="1mglay" />
    <line x1="12" x2="12" y1="8" y2="12" key="1pkeuh" />
    <line x1="12" x2="12.01" y1="16" y2="16" key="4dfq90" />
  </svg>
);

export const HardDrive = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <line x1="22" x2="2" y1="12" y2="12" key="1y58io" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" key="oot6mr" />
    <line x1="6" x2="6.01" y1="16" y2="16" key="sgf278" />
    <line x1="10" x2="10.01" y1="16" y2="16" key="1l4acy" />
  </svg>
);

export const Activity = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} {...iconDefaults} {...props}>
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" key="169zse" />
  </svg>
);

