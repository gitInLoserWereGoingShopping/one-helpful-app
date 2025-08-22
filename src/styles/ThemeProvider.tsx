import React from "react";
import type { GameTheme } from "./themes";
import { THEMES, generateCSSVariables } from "./themes";
import { ThemeContext } from "./ThemeContext";

interface ThemeProviderProps {
  children: React.ReactNode;
  themeId?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  themeId = "hub",
}) => {
  const currentTheme = THEMES[themeId as keyof typeof THEMES] || THEMES.hub;

  const setTheme = (newThemeId: string) => {
    const theme = THEMES[newThemeId as keyof typeof THEMES];
    if (theme) {
      applyTheme(theme);
    }
  };

  const applyTheme = (theme: GameTheme) => {
    const root = document.documentElement;
    const cssVariables = generateCSSVariables(theme);

    // Apply CSS custom properties to root
    const lines = cssVariables.trim().split("\n");
    lines.forEach((line) => {
      const [property, value] = line.split(":").map((s) => s.trim());
      if (property.startsWith("--") && value) {
        root.style.setProperty(property, value.replace(";", ""));
      }
    });
  };

  React.useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
