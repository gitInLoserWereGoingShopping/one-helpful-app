import { createContext } from "react";
import type { GameTheme } from "./themes";
import { THEMES } from "./themes";

interface ThemeContextType {
  currentTheme: GameTheme;
  setTheme: (themeId: string) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  currentTheme: THEMES.hub,
  setTheme: () => {},
});
