'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeKey, themes } from './themes';

type ThemeColors = typeof themes['dark-premium']['colors'];
type ThemeGradients = typeof themes['dark-premium']['gradients'];

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  colors: ThemeColors;
  gradients: ThemeGradients;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark-premium',
  setTheme: () => {},
  colors: themes['dark-premium'].colors,
  gradients: themes['dark-premium'].gradients,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>('dark-premium');

  useEffect(() => {
    const saved = localStorage.getItem('site-theme') as ThemeKey;
    if (saved && themes[saved]) setThemeState(saved);
  }, []);

  const setTheme = (t: ThemeKey) => {
    setThemeState(t);
    localStorage.setItem('site-theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const current = themes[theme];
  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: current.colors, gradients: current.gradients }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
