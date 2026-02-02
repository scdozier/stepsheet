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
    containerBg: 'rgba(30, 30, 30, 0.95)',
    headerBg: 'rgba(40, 40, 40, 0.9)',
    sectionBg: 'rgba(45, 45, 45, 0.8)',
    hoverBg: 'rgba(60, 60, 60, 0.5)',
    activeBg: 'rgba(0, 122, 255, 0.1)',
    
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#888888',
    textCompleted: '#666666',
    
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    activeBorder: '#007AFF',
    
    accent: '#007AFF',
    accentHover: '#0056b3',
    checkmark: '#007AFF',
    
    buttonBg: 'rgba(80, 80, 80, 0.8)',
    buttonHoverBg: 'rgba(100, 100, 100, 0.8)',
    dangerBg: 'rgba(255, 59, 48, 0.7)',
    warningBg: 'rgba(255, 149, 0, 0.8)',
  },
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    containerBg: 'rgba(255, 255, 255, 0.95)',
    headerBg: 'rgba(245, 245, 247, 0.95)',
    sectionBg: 'rgba(240, 240, 242, 0.9)',
    hoverBg: 'rgba(0, 0, 0, 0.05)',
    activeBg: 'rgba(0, 122, 255, 0.08)',
    
    textPrimary: '#1d1d1f',
    textSecondary: '#424245',
    textMuted: '#86868b',
    textCompleted: '#aeaeb2',
    
    border: 'rgba(0, 0, 0, 0.1)',
    borderLight: 'rgba(0, 0, 0, 0.05)',
    activeBorder: '#007AFF',
    
    accent: '#007AFF',
    accentHover: '#0056b3',
    checkmark: '#007AFF',
    
    buttonBg: 'rgba(0, 0, 0, 0.06)',
    buttonHoverBg: 'rgba(0, 0, 0, 0.1)',
    dangerBg: 'rgba(255, 59, 48, 0.85)',
    warningBg: 'rgba(255, 149, 0, 0.85)',
  },
};

export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
