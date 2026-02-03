// Theme definitions for dark and light modes

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  mode: ThemeMode;
  colors: {
    // Backgrounds
    containerBg: string;
    headerBg: string;
    sectionBg: string;
    hoverBg: string;
    activeBg: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textCompleted: string;
    activeText: string;

    // Borders
    border: string;
    borderLight: string;
    activeBorder: string;

    // Accents
    accent: string;
    accentHover: string;
    checkmark: string;

    // Buttons
    buttonBg: string;
    buttonHoverBg: string;
    dangerBg: string;
    warningBg: string;
  };
}

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    // Refined dark backgrounds with subtle blue undertones
    containerBg: 'rgba(22, 24, 28, 0.97)',
    headerBg: 'rgba(32, 34, 40, 0.95)',
    sectionBg: 'rgba(38, 41, 48, 0.9)',
    hoverBg: 'rgba(70, 75, 85, 0.45)',
    activeBg: 'rgba(56, 139, 255, 0.12)',

    // Softer text colors for better readability
    textPrimary: '#f5f5f7',
    textSecondary: '#b8bcc5',
    textMuted: '#8e929a',
    textCompleted: '#5a5d65',
    activeText: '#3b8eff',

    // More visible borders
    border: 'rgba(255, 255, 255, 0.12)',
    borderLight: 'rgba(255, 255, 255, 0.06)',
    activeBorder: '#3b8eff',

    // Brighter, more vibrant accent colors
    accent: '#3b8eff',
    accentHover: '#5ca0ff',
    checkmark: '#3b8eff',

    // Refined button backgrounds
    buttonBg: 'rgba(85, 90, 100, 0.6)',
    buttonHoverBg: 'rgba(105, 110, 120, 0.7)',
    dangerBg: 'rgba(255, 69, 58, 0.75)',
    warningBg: 'rgba(255, 159, 10, 0.8)',
  },
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    // Clean, crisp backgrounds with warmer tones
    containerBg: 'rgba(252, 252, 253, 0.97)',
    headerBg: 'rgba(242, 242, 245, 0.97)',
    sectionBg: 'rgba(235, 236, 240, 0.92)',
    hoverBg: 'rgba(0, 0, 0, 0.06)',
    activeBg: 'rgba(0, 102, 230, 0.1)',

    // Rich, readable text colors
    textPrimary: '#1a1a1c',
    textSecondary: '#3d3d42',
    textMuted: '#6e6e76',
    textCompleted: '#9d9da5',
    activeText: '#0066e6',

    // Stronger borders for definition
    border: 'rgba(0, 0, 0, 0.12)',
    borderLight: 'rgba(0, 0, 0, 0.06)',
    activeBorder: '#0066e6',

    // Slightly deeper blue for better visibility
    accent: '#0066e6',
    accentHover: '#0052cc',
    checkmark: '#0066e6',

    // More visible button backgrounds
    buttonBg: 'rgba(0, 0, 0, 0.07)',
    buttonHoverBg: 'rgba(0, 0, 0, 0.12)',
    dangerBg: 'rgba(255, 59, 48, 0.9)',
    warningBg: 'rgba(255, 149, 0, 0.9)',
  },
};

export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
