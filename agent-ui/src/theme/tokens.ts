/**
 * Design System Tokens for CreateSuite Agent UI
 * 
 * This file defines the core design tokens for the Windows 95-styled
 * agent UI. All colors, spacing, and typography should reference
 * these tokens to ensure consistency.
 */

// Colors
export const colors = {
  // Background
  desktop: '#008080',
  windowBg: '#c0c0c0',
  
  // Text
  textPrimary: '#000000',
  textSecondary: '#555555',
  
  // Status colors
  success: '#00aa00',
  warning: '#aaaa00',
  error: '#aa0000',
  info: '#0000aa',
  
  // Terminal
  terminalBg: '#000000',
  terminalFg: '#ffffff',
  
  // Interactive
  buttonPrimary: '#c0c0c0',
  buttonHover: '#dcdcdc',
  buttonActive: '#a0a0a0',
  
  // Borders
  borderLight: '#ffffff',
  borderDark: '#808080',
  borderDarker: '#404040',
  
  // Selection
  selectionBg: '#000080',
  selectionFg: '#ffffff',
} as const;

// Spacing (4px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Typography
export const typography = {
  fontFamily: "'ms_sans_serif', 'Segoe UI', sans-serif",
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  fontWeight: {
    normal: 400,
    bold: 700,
  },
  lineHeight: 1.4,
} as const;

// Window dimensions
export const windowDimensions = {
  minWidth: 300,
  minHeight: 200,
  defaultWidth: 600,
  defaultHeight: 400,
  maxWidth: 'calc(100vw - 100px)',
  maxHeight: 'calc(100vh - 100px)',
} as const;

// Z-index scale
export const zIndex = {
  base: 1,
  taskbar: 10000,
  startMenu: 10001,
  subMenu: 10002,
  modal: 20000,
} as const;

// Transitions
export const transitions = {
  fast: '0.1s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
} as const;

// Shadows
export const shadows = {
  window: '2px 2px 0 #404040, -1px -1px 0 #ffffff',
  raised: '1px 1px 0 #404040, -1px -1px 0 #ffffff, 2px 2px 4px rgba(0,0,0,0.3)',
} as const;

// Border radius (minimal for Win95 look)
export const borderRadius = {
  none: 0,
  sm: 0,
  md: 0,
  lg: 0,
} as const;

// Export as CSS custom properties for runtime use
export const cssVariables = `
  --color-desktop: ${colors.desktop};
  --color-window-bg: ${colors.windowBg};
  --color-text-primary: ${colors.textPrimary};
  --color-terminal-bg: ${colors.terminalBg};
  --color-terminal-fg: ${colors.terminalFg};
  --color-success: ${colors.success};
  --color-warning: ${colors.warning};
  --color-error: ${colors.error};
  
  --spacing-xs: ${spacing.xs}px;
  --spacing-sm: ${spacing.sm}px;
  --spacing-md: ${spacing.md}px;
  --spacing-lg: ${spacing.lg}px;
  --spacing-xl: ${spacing.xl}px;
  
  --font-family: ${typography.fontFamily};
  --font-size-sm: ${typography.fontSize.sm}px;
  --font-size-md: ${typography.fontSize.md}px;
  
  --z-index-taskbar: ${zIndex.taskbar};
  --z-index-modal: ${zIndex.modal};
  
  --shadow-window: ${shadows.window};
`.trim();

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type TypographyToken = keyof typeof typography;
