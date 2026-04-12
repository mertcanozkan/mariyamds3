"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeName =
  | "midnight"
  | "emerald"
  | "crimson"
  | "ocean"
  | "slate"
  | "plum"
  | "rose-gold"
  | "nordic"
  | "obsidian";

export interface ThemeMeta {
  name: ThemeName;
  label: string;
  primary: string;  // hex — used for swatch rendering only
  accent: string;   // hex — used for swatch rendering only
}

export const THEMES: ThemeMeta[] = [
  { name: "midnight",  label: "Midnight",  primary: "#0F1F3D", accent: "#F5A623" },
  { name: "emerald",   label: "Emerald",   primary: "#0D3B2E", accent: "#D4A017" },
  { name: "crimson",   label: "Crimson",   primary: "#5C1A1A", accent: "#F4845F" },
  { name: "ocean",     label: "Ocean",     primary: "#0D3B4A", accent: "#FF6B4A" },
  { name: "slate",     label: "Slate",     primary: "#1A1A2E", accent: "#4F8EF7" },
  { name: "plum",      label: "Plum",      primary: "#2D1B69", accent: "#39D0A0" },
  { name: "rose-gold", label: "Rose Gold", primary: "#4A2035", accent: "#D4A27A" },
  { name: "nordic",    label: "Nordic",    primary: "#1B2D40", accent: "#A8D455" },
  { name: "obsidian",  label: "Obsidian",  primary: "#171717", accent: "#FF5A1F" },
];

const VALID_NAMES = THEMES.map((t) => t.name);
const STORAGE_KEY = "mds-theme";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "midnight",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("midnight");

  // Sync from localStorage on first mount (SSR-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
      if (stored && VALID_NAMES.includes(stored)) {
        setThemeState(stored);
        document.documentElement.setAttribute("data-theme", stored);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // localStorage not available
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
